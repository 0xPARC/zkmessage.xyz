import React, { useEffect, useState } from "react"
import copy from "copy-text-to-clipboard"
import {
	LOCAL_STORAGE_SECRET_KEY,
	LOCAL_STORAGE_SECRET_KEY_UNVERIFIED,
} from "utils/localStorage"
import { mimcHash } from "utils/mimc"

import { Header } from "components/Header"
import Link from "next/link"
import { useRouter } from "next/router"

export default function BackupPage(props: {}) {
	const router = useRouter()
	const [secret, setSecret] = useState<null | string>(null)
	const [copied, setCopied] = useState<boolean>(false)

	useEffect(() => {
		const unverifiedSecret = localStorage.getItem(
			LOCAL_STORAGE_SECRET_KEY_UNVERIFIED
		)
		if (localStorage.getItem(LOCAL_STORAGE_SECRET_KEY)) {
			router.push("/")
		} else if (unverifiedSecret === null || unverifiedSecret.length !== 64) {
			console.log("generating key")
			const array = new Uint8Array(32)
			crypto.getRandomValues(array)
			setSecret(Buffer.from(array).toString("hex"))
			localStorage.setItem(LOCAL_STORAGE_SECRET_KEY_UNVERIFIED, secret)
		} else {
			setSecret(unverifiedSecret)
		}
	}, [])

	return (
		<div className="max-w-lg m-auto font-mono">
			<Header />
			<div className="border border-gray-300 rounded-xl p-6">
				<div>This is your ZK CHAT login token. Keep it secret and save it somewhere safe:</div>
				<textarea
					className="block w-full outline-none py-5 px-6 my-6 resize-none text-gray-800"
					rows={3}
					readOnly
					value={secret}
				/>
				<input
					className="block w-full cursor-pointer bg-gray-300 text-gray-800 rounded-xl px-4 py-2 my-4"
					type="button"
					value={copied ? "Copied!" : "Copy"}
					onClick={() => {
						copy(secret)
						setCopied(true)
					}}
				/>
				<Link href="/connect">
					<div className="cursor-pointer bg-pink text-white text-center rounded-xl px-4 py-2">
						Next
					</div>
				</Link>
			</div>
		</div>
	)
}
