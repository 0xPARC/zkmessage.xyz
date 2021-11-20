import React, { useState } from "react"

import type { User } from "utils/types"
import { UserIcon } from "components/UserIcon"

interface SelectUsersProps {
	publicKey: string | null
	users: User[]
	updateSelectedUsers: (selectedUsers: string[]) => void
}

export function SelectUsers({
	publicKey,
	users,
	updateSelectedUsers,
}: SelectUsersProps) {
	const [selectedUsers, setSelectedUsers] = useState<string[]>([])

	return (
		<>
			{users.length === 0 && (
				<div className="text-gray-400">No registered users</div>
			)}
			{users.map((user) => (
				<div
					key={user.publicKey}
					className={`block mb-1 flex ${
						user.publicKey === publicKey ? "bg-blue-100" : ""
					}`}
				>
					<label
						htmlFor={user.publicKey}
						className="flex-1 flex py-0.5 leading-tight"
					>
						<UserIcon url={user.twitterProfileImage} />
						<div className="flex-1 ml-3 pt-1 ">
							<a
								href={`https://twitter.com/${user.twitterHandle}`}
								target="_blank"
							>
								<div className="cursor-pointer hover:underline inline-block">
									{user.twitterHandle}
								</div>
							</a>
							<a
								href={`https://twitter.com/${user.twitterHandle}/status/${user.verificationTweetId}`}
								target="_blank"
							>
								<img
									src="/key.svg"
									width="16"
									className="inline-block ml-1 -mt-0.5 opacity-20 hover:opacity-70"
								/>
							</a>
						</div>
					</label>

					{publicKey && (
						<input
							className="mt-2.5"
							type="checkbox"
							id={user.publicKey}
							disabled={user.publicKey === publicKey}
							checked={
								user.publicKey === publicKey ||
								selectedUsers.indexOf(user.publicKey) !== -1
							}
							onChange={() => {
								if (selectedUsers.indexOf(user.publicKey) === -1) {
									setSelectedUsers(selectedUsers.concat(user.publicKey))
								} else {
									setSelectedUsers(
										selectedUsers.filter((h) => h !== user.publicKey)
									)
								}
								updateSelectedUsers(selectedUsers)
							}}
						/>
					)}
				</div>
			))}
		</>
	)
}
