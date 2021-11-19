import React, { useEffect, useState } from "react"
import copy from 'copy-text-to-clipboard';
import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"
import { mimcHash } from "utils/mimc"

import Link from "next/link"
import { useRouter } from "next/router"

export default function BackupPage(props: {}) {
	const router = useRouter()
	const [secret, setSecret] = useState<null | string>(null)
	const [copied, setCopied] = useState<boolean>(false)

	useEffect(() => {
		const secret = localStorage.getItem(LOCAL_STORAGE_SECRET_KEY)
		if (secret === null) {
			router.push("/login")
		} else {
			const n = BigInt("0x" + secret)
			const h = mimcHash(n)
			setSecret(h.toString(16))
		}
	}, [])

	return (
		<div className="max-w-lg m-auto font-mono">
			<h1 className="uppercase font-bold pt-16 pb-6">zk chat</h1>
			<div className="border border-gray-300 rounded-xl p-6">
				<div>This is your ZK CHAT secret token. Save it somewhere safe:</div>
				<textarea
					className="block w-full outline-none py-5 px-6 my-6 resize-none text-gray-800"
					rows={3} readonly value={secret} />
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
