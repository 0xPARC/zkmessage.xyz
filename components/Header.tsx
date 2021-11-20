import React, { useState, useEffect } from "react"
import Link from "next/link"
import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"

export function Header({ users, publicKey }) {
	const user = users?.find((u) => u.publicKey === publicKey)
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
						zk message board
					</h1>
				</Link>
			</div>
			<div>
				{secret ? (
					<div className="mt-16">
						<div className="inline mr-6">
							{user ? (
								<a
									className="cursor-pointer hover:underline"
									href={`https://twitter.com/${user.twitterHandle}`}
									target="_blank"
								>
									{user.twitterHandle}
								</a>
							) : (
								<Link href="/connect">
									<div className="inline cursor-pointer hover:underline">
										Connect Twitter
									</div>
								</Link>
							)}
						</div>
						<div
							className="inline cursor-pointer hover:underline"
							onClick={() => {
								localStorage.clear()
								document.location = "/"
							}}
						>
							Logout
						</div>
					</div>
				) : (
					<Link href="/login">
						<div className="cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 pb-1.5 mt-14">
							Login
						</div>
					</Link>
				)}
			</div>
		</div>
	)
}
