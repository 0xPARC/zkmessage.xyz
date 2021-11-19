import React, { useCallback, useEffect, useState } from "react"

import { useRouter } from "next/router"

import { Buffer } from "buffer"

import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"

import { Header } from "./index"

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
		router.push("/backup")
	}, [])

	const handleGenerateKey = useCallback(() => {
		console.log("generating key")
		const array = new Uint8Array(32)
		crypto.getRandomValues(array)
		const secret = Buffer.from(array).toString("hex")
		localStorage.setItem(LOCAL_STORAGE_SECRET_KEY, secret)
		router.push("/backup")
	}, [])

	return (
		<div className="max-w-lg m-auto font-mono">
			<Header />
			<div className="border border-gray-300 rounded-xl p-6 text-center">
				<input
					className="px-4 py-3 rounded-xl outline-none border border-transparent focus:border-pink"
					type="text"
					placeholder="Your secret token"
					value={value}
					onChange={(event) => setValue(event.target.value)}
				/>
				<br />
				<button
					disabled={value === ""}
					onClick={() => handleLogin(value)}
					className="block w-full cursor-pointer bg-pink text-white rounded-xl px-4 py-2 mt-2 mb-3 text-center"
				>
					Login
				</button>
				or
				<button
					disabled={value === ""}
					onClick={() => handleGenerateKey()}
					className="block w-full cursor-pointer bg-pink text-white rounded-xl px-4 py-2 mt-2 mb-3 text-center"
				>
					Sign up (generate a new secret token)
				</button>
			</div>
		</div>
	)
}
