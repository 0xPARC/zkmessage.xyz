import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"

import { Buffer } from "buffer"

import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"

import { Header } from "components/Header"

export default function LoginPage(props: {}) {
	const [value, setValue] = useState("")

	const router = useRouter()

	useEffect(() => {
		const secret = localStorage.getItem(LOCAL_STORAGE_SECRET_KEY)
		if (secret !== null) {
			setValue(secret)
		}
	}, [])

	const handleLogin = useCallback((value: string) => {
		const _ = Buffer.from(value, "hex") // just make sure it's a valid hex string
		localStorage.setItem(LOCAL_STORAGE_SECRET_KEY, value)
		router.push("/")
	}, [])

	return (
		<div className="max-w-lg m-auto font-mono">
			<Header />
			<div className="border border-gray-300 rounded-xl p-6">
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
					disabled={value === ""}
					onClick={() => handleLogin(value)}
					className="block w-full cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-2 mb-3 text-center"
				>
					Login
				</button>
				<div className="mt-8 mb-4">Or sign up for a new account:</div>
				<Link href="/backup">
					<div className="block w-full cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-2 mb-1 text-center">
						Sign up (generate a new token)
					</div>
				</Link>
			</div>
		</div>
	)
}
