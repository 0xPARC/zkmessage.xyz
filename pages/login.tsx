import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import type { GetServerSideProps } from "next"
import { useRouter } from "next/router"

import nookies from "nookies"

import type { PageProps } from "utils/types"

import { prisma } from "utils/server/prisma"
import {
	LOCAL_STORAGE_SECRET_KEY,
	LOCAL_STORAGE_SECRET_KEY_UNVERIFIED,
} from "utils/client/localStorage"

import { Buffer } from "buffer"
import { derivePublicKey } from "utils/mimc"
import { PageContext } from "utils/context"
import { hexPattern } from "utils/hexPattern"

interface LoginPageProps extends PageProps {}

type LoginPageParams = { error?: string }

export const getServerSideProps: GetServerSideProps<
	LoginPageProps,
	LoginPageParams
> = async (ctx) => {
	const { publicKey } = nookies.get(ctx)

	if (publicKey !== undefined) {
		const user = await prisma.user.findUnique({
			where: { publicKey },
			select: { publicKey: true },
		})

		if (user === null) {
			nookies.destroy(ctx, "publicKey")
		} else {
			return { redirect: { destination: "/", permanent: false } }
		}
	}

	return { props: { user: null } }
}

const accountNotFoundError = "account_not_found"

export default function LoginPage(props: LoginPageProps) {
	// this is really ugly and i'm sorry.
	const loaded = useRef(false)
	const {
		loading,
		secretKey,
		unverifiedSecretKey,
		setUser,
		setSecretKey,
		setUnverifiedSecretKey,
	} = useContext(PageContext)

	const [value, setValue] = useState("")
	const valid = useMemo(() => hexPattern.test(value), [value])

	const router = useRouter()

	useEffect(() => {
		if (!loading && !loaded.current) {
			if (secretKey !== null) {
				setValue(secretKey)
			} else if (unverifiedSecretKey !== null) {
				setValue(unverifiedSecretKey)
			}
			loaded.current = true
		}
	}, [secretKey, unverifiedSecretKey, loading])

	const handleLogin = useCallback(async () => {
		console.log("loggin in", valid, value)
		if (valid) {
			// if login is successful then this value will get set to
			// LOCAL_STORAGE_SECRET_KEY in the first effect callback in _app.tsx
			localStorage.setItem(LOCAL_STORAGE_SECRET_KEY_UNVERIFIED, value)
			const publicKey = derivePublicKey(value)
			// set the cookie client side and reload the page.
			// if the public key is registered on the server then
			// the server will redirect us to the homepage.
			// if the public key is not registsered then the server
			// will clear the publicKey cookie.
			// setCookie(null, "publicKey", publicKey, {
			// 	maxAge: 30 * 24 * 60 * 60,
			// 	path: "/",
			// 	secure: true,
			// })

			const res = await fetch(`/api/login?publicKey=${publicKey}`, {
				method: "POST",
			})

			if (res.status === 200) {
				const { user } = await res.json()
				localStorage.setItem(LOCAL_STORAGE_SECRET_KEY, value)
				setSecretKey(value)
				setUser(user)
				router.push("/")
				// window.location.href = "/"
			} else {
				setUser(null)
				router.push(`/login?error=${accountNotFoundError}`)
				// window.location.href = `/login?error=${accountNotFoundError}`
			}
		}
	}, [value, valid])

	const handleSignUp = useCallback(() => {
		console.log("generating a new secret key")
		const array = new Uint8Array(32)
		crypto.getRandomValues(array)
		const v = Buffer.from(array).toString("hex")
		localStorage.setItem(LOCAL_STORAGE_SECRET_KEY_UNVERIFIED, v)
		setUnverifiedSecretKey(v)
		router.push("/backup")
	}, [])

	return (
		<div className="mt-16 max-w-lg m-auto font-mono">
			<div className="m-2 border border-gray-300 rounded-xl p-6">
				<div className="text-left mb-4">Log in with a secret token:</div>
				<textarea
					className="w-full resize-none px-4 py-3 rounded-xl outline-none border border-transparent"
					rows={3}
					placeholder="Your secret token"
					value={value}
					onChange={(event) => setValue(event.target.value)}
				/>
				<br />
				<button
					disabled={!valid}
					onClick={handleLogin}
					className={
						valid
							? "block w-full cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-2 mb-3 text-center"
							: "block w-full cursor-not-allowed bg-gray-300 text-gray-800 rounded-xl px-4 py-2 mt-2 mb-3 text-center"
					}
				>
					Login
				</button>
				<div className="mt-8 mb-4">Or sign up for a new account:</div>
				<button
					onClick={handleSignUp}
					className="block w-full cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-2 mb-1 text-center"
				>
					Sign up (generate a new token)
				</button>
			</div>
			{router.query.error === accountNotFoundError && (
				<div className="m-2 border border-gray-300 bg-gray-200 rounded-xl p-6">
					We couldn't find an account associated with that token. Sign up for a
					new account if you haven't!
				</div>
			)}
		</div>
	)
}
