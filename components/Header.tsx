import React, { useCallback, useContext } from "react"
import Link from "next/link"

import {
	LOCAL_STORAGE_SECRET_KEY,
	LOCAL_STORAGE_SECRET_KEY_UNVERIFIED,
} from "utils/client/localStorage"
import { PageContext } from "utils/context"

export const Header: React.FC<{ titleOnly?: boolean }> = ({ titleOnly }) => {
	return (
		<div className="flex mt-16 mb-6">
			<div className="flex-1">
				<Link href="/">
					<h1 className="inline-block cursor-pointer uppercase font-bold">
						zk message board
					</h1>
				</Link>
			</div>
			<AuthenticationControls />
		</div>
	)
}

const AuthenticationControls: React.FC<{}> = ({}) => {
	const { user, setUser, setSecretKey, setUnverifiedSecretKey } =
		useContext(PageContext)

	const handleLogout = useCallback(async () => {
		localStorage.removeItem(LOCAL_STORAGE_SECRET_KEY)
		localStorage.removeItem(LOCAL_STORAGE_SECRET_KEY_UNVERIFIED)
		const res = await fetch("/api/logout", { method: "POST" })
		if (res.status === 200) {
			setUser(null)
			setSecretKey(null)
			setUnverifiedSecretKey(null)
		} else {
			console.error(res.status, await res.text())
			alert("server error: could not log out")
		}
	}, [])

	if (user === null) {
		return (
			<div>
				<a
					href="/login"
					className="cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 pb-1.5 mt-14"
				>
					Login
				</a>
			</div>
		)
	} else {
		return (
			<div>
				<div className="inline mr-6">
					<a
						className="cursor-pointer hover:underline"
						href={`https://twitter.com/${user.twitterHandle}`}
						target="_blank"
					>
						{user.twitterHandle}
					</a>
				</div>
				<div
					className="inline cursor-pointer hover:underline"
					onClick={handleLogout}
				>
					Logout
				</div>
			</div>
		)
	}
}
