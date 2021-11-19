import React from "react"
import Link from "next/link"

export function Header() {
	return (
		<div className="flex-1 mt-16 mb-6">
			<Link href="/">
				<h1 className="inline-block cursor-pointer uppercase font-bold">
					zk chat
				</h1>
			</Link>
		</div>
	)
}
