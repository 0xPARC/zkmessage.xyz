import React, { useCallback, useEffect, useMemo, useState } from "react"

import { Buffer } from "buffer"

import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"
import { useRouter } from "next/dist/client/router"

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
			<div className="border border-gray-300 rounded-xl p-6">
				<input
					type="text"
					placeholder="Your secret token"
					value={value}
					onChange={(event) => setValue(event.target.value)}
				/>
				<br />
				<button disabled={value === ""} onClick={() => handleLogin(value)}>
					Login
				</button>
				<br />
				or
				<br />
				<button onClick={() => handleGenerateKey()}>
					Sign up (generate a new key)
				</button>
			</div>
		</div>
	)
}
