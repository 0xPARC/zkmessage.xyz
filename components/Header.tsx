import React, { useState, useEffect } from "react"
import Link from "next/link"
import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"

export function Header() {
	const [secret, setSecret] = useState("")
	useEffect(() => {
		const secret = localStorage.getItem(LOCAL_STORAGE_SECRET_KEY)
		if (secret !== null) {
			setSecret(secret)
		}
	}, [])

	return (
		<div className="flex">
			<div className="flex-1 mt-16 mb-6">
				<Link href="/">
					<h1 className="inline-block cursor-pointer uppercase font-bold">
						zk chat
					</h1>
				</Link>
			</div>
			<div>
				{secret ? (
					<div
						className="cursor-pointer hover:underline mt-16"
						onClick={() => {
							localStorage.clear()
							document.location = "/"
						}}
					>
						Logout
					</div>
				) : (
					<Link href="/login">
						<div className="cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-14">
							Login
						</div>
					</Link>
				)}
			</div>
		</div>
	)
}
