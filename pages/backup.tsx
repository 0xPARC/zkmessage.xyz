import React, { useEffect, useState } from "react"
import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"
import { mimcHash } from "utils/mimc"

import Link from "next/link"
import { useRouter } from "next/router"

export default function BackupPage(props: {}) {
	const router = useRouter()
	const [secret, setSecret] = useState<null | string>(null)

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
				<p>This is your ZK CHAT token.</p>
				<p>Save it somewhere safe:</p>
				<div className="break-all mt-6 mb-6">{secret}</div>
				<Link href="/connect">
					<div className="cursor-pointer bg-pink text-white rounded-xl px-4 py-2">
						Next
					</div>
				</Link>
			</div>
		</div>
	)
}
