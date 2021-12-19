import React, { useCallback, useContext, useEffect, useState } from "react"

import { GetServerSideProps } from "next"
import { useRouter } from "next/router"

import nookies from "nookies"

import { PageProps } from "utils/types"
import { PageContext } from "utils/context"
import { getTextFromPublicKey } from "utils/verification"
import { derivePublicKey } from "utils/mimc"
import { LOCAL_STORAGE_SECRET_KEY } from "utils/client/localStorage"

interface ConnectPageProps extends PageProps {}

export const getServerSideProps: GetServerSideProps<ConnectPageProps, {}> =
	async (ctx) => {
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

export default function ConnectPage(props: ConnectPageProps) {
	const { unverifiedSecretKey, setSecretKey, setUser } = useContext(PageContext)

	const [publicKey, setPublicKey] = useState<string | null>(null)
	const [waiting, setWaiting] = useState<boolean>(false)
	const [intent, setIntent] = useState<string | null>(null)

	useEffect(() => {
		if (unverifiedSecretKey !== null) {
			const publicKey = derivePublicKey(unverifiedSecretKey)
			setPublicKey(publicKey)
			const text = getTextFromPublicKey(publicKey)
			const intent = `https://twitter.com/intent/tweet?text=${text}`
			setIntent(intent)
		}
	}, [unverifiedSecretKey])

	const router = useRouter()

	const openTwitterIntent = useCallback(() => {
		if (intent !== null) {
			window.open(intent)
			setWaiting(true)
			setTimeout(() => setWaiting(false), 10000)
		}
	}, [intent])

	const createUser = useCallback(async () => {
		if (unverifiedSecretKey === null || publicKey === null || waiting) {
			return
		}

		const res = await fetch(`/api/users?publicKey=${publicKey}`, {
			method: "POST",
		})
		if (res.status === 200) {
			const user = await res.json()
			localStorage.setItem(LOCAL_STORAGE_SECRET_KEY, unverifiedSecretKey)
			setSecretKey(unverifiedSecretKey)
			setUser(user)
			router.push("/")
		} else {
			alert("Could not verify user! Did you post the tweet?")
		}
	}, [unverifiedSecretKey, publicKey, waiting])

	return (
		<div className="mt-16 max-w-lg m-auto font-mono">
			<div className="m-2 border border-gray-300 rounded-xl p-6">
				<div>
					Verify ownership of your secret token by posting a signed message to
					Twitter:
				</div>
				<button
					onClick={openTwitterIntent}
					disabled={intent === null}
					className={
						intent === null
							? "block w-full text-center cursor-not-allowed bg-gray-300 text-gray-800 rounded-xl px-4 py-2 mt-6"
							: "block w-full text-center cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-6"
					}
				>
					Post to Twitter
				</button>
				<button
					className={
						waiting
							? "block w-full cursor-not-allowed bg-gray-300 text-gray-800 rounded-xl px-4 py-2 mt-3 opacity-50"
							: "block w-full cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-3"
					}
					type="button"
					disabled={waiting}
					onClick={createUser}
				>
					{waiting ? "Wait 10 seconds..." : "Check"}
				</button>
			</div>
		</div>
	)
}
