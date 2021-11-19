import React, { useCallback, useEffect, useRef, useState } from "react"
import { Header } from "components/Header"
import { getTextFromPublicKey } from "utils/verification"
import { LOCAL_STORAGE_SECRET_KEY_UNVERIFIED } from "utils/localStorage"
import { mimcHash } from "utils/mimc"
import { useRouter } from "next/router"

import api from "next-rest/client"

export default function ConnectPage(props: {}) {
	const publicKey = useRef<string | null>(null)
	const [intent, setIntent] = useState<string | null>(null)
	useEffect(() => {
		const secret = localStorage.getItem(LOCAL_STORAGE_SECRET_KEY_UNVERIFIED)
		if (secret !== null) {
			const n = BigInt("0x" + secret)
			const h = mimcHash(n)
			publicKey.current = h.toString(16)
			const text = getTextFromPublicKey(publicKey.current)
			setIntent(`https://twitter.com/intent/tweet?text=${text}`)
		}
	})

	const router = useRouter()

	const [openedTwitterIntent, setOpenedTwitterIntent] = useState(false)

	const openTwitterIntent = useCallback((intent: string) => {
		if (intent !== null) {
			window.open(intent)
			setOpenedTwitterIntent(true)
		}
	}, [])

	const createUser = useCallback(() => {
		if (publicKey.current !== null) {
			api.post("/api/users", {
				params: {},
				headers: { "content-type": "application/json" },
				body: { publicKey: publicKey.current },
			})
		}
	}, [])

	return (
		<div className="max-w-lg m-auto font-mono">
			<Header />
			<div className="border border-gray-300 rounded-xl p-6">
				<div>
					Verify ownership of your secret token by posting a signed message to
					Twitter:
				</div>
				{intent === null ? (
					<div className="block w-full cursor-not-allowed bg-gray-300 text-gray-800 rounded-xl px-4 py-2 mt-6">
						Post to Twitter
					</div>
				) : (
					<button
						onClick={() => openTwitterIntent(intent)}
						className="block w-full text-center cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-6"
					>
						Post to Twitter
					</button>
				)}
				{openedTwitterIntent ? (
					<button
						className="block w-full cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-6"
						type="button"
						onClick={() => createUser()}
					>
						Check
					</button>
				) : (
					<button className="block w-full cursor-not-allowed bg-gray-300 text-gray-800 rounded-xl px-4 py-2 mt-6">
						Check
					</button>
				)}

				<input
					className="block w-full cursor-pointer bg-gray-300 text-gray-800 rounded-xl px-4 py-2 mt-6"
					type="button"
					value="Back"
					onClick={() => router.push("/backup")}
				/>
			</div>
		</div>
	)
}
