import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Buffer } from "buffer"

import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"
import { useRouter } from "next/router"

export default function LoginPage(props: {}) {
	const [value, setValue] = useState("")

	const router = useRouter()

	useEffect(() => {
		const secret = localStorage.getItem(LOCAL_STORAGE_SECRET_KEY)
		if (secret !== null) {
			Buffer.from(secret, "hex").toString()
		}
	})

	const save = useCallback((secret: Buffer) => {
		localStorage.setItem(LOCAL_STORAGE_SECRET_KEY, secret.toString("hex"))
		router.push("/connect")
	}, [])

	const handleLogin = useCallback((value: string) => {
		save(Buffer.from(value))
	}, [])

	const handleGenerateKey = useCallback(() => {
		const array = new Uint8Array(32)
		crypto.getRandomValues(array)
		save(Buffer.from(array))
	}, [])

	return (
		<div className="max-w-lg m-auto font-mono">
			<h1 className="uppercase font-bold pt-16 pb-6">zk chat</h1>
			<div className="border border-gray-300 rounded-xl p-6 text-center">
				<input
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
				<Link href="/connect">
					<div className="cursor-pointer bg-pink text-white rounded-xl px-4 py-2 mt-3 text-center">
						Sign up (generate a new key)
					</div>
				</Link>
			</div>
		</div>
	)
}
