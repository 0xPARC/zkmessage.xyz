import { User } from "utils/types"

interface UserIconProps {
	user: User
}

export function UserIcon({ user }: UserIconProps) {
	return (
		<a
			href={`https://twitter.com/${user.twitterHandle}`}
			className="inline-block relative h-6 w-6 bg-gray-200 rounded-full text-center text-gray-400 overflow-hidden border border-gray-200 flex-none"
		>
			<img
				className="absolute w-full h-full top-0 left-0"
				src={user.twitterProfileImage}
				alt={user.twitterHandle}
			/>
		</a>
	)
}
