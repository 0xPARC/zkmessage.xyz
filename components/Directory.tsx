import React from "react"
import { User } from "utils/types"
import { UserIcon } from "./UserIcon"

interface DirectoryProps {
	users: User[]
	userCount: number
}

export const Directory: React.FC<DirectoryProps> = (props) => {
	const rest = props.userCount - props.users.length
	return (
		<div className="p-4 bg-white rounded-lg flex flex-col gap-2">
			{props.users.map((user) => (
				<div key={user.publicKey} className="flex gap-2 items-center w-full">
					<UserIcon user={user} />
					<a
						className="mt-0.5 hover:underline flex-1 overflow-hidden overflow-ellipsis"
						href={`https://twitter.com/${user.twitterHandle}`}
					>
						{user.twitterHandle}
					</a>
					<a
						href={`https://twitter.com/${user.twitterHandle}/status/${user.verificationTweetId}`}
						className="flex-none"
					>
						<img
							width={16}
							src="/key.svg"
							className="inline-block opacity-20 hover:opacity-70"
						/>
					</a>
				</div>
			))}
			{rest > 0 && (
				<a href="/users" className="hover:underline self-end">
					... all users
				</a>
			)}
		</div>
	)
}
