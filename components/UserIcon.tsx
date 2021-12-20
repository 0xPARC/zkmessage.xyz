import { useState } from "react";
import { User } from "utils/types"
import Image from 'next/image';

interface UserIconProps {
	user: User
}

export function UserIcon({ user }: UserIconProps) {
	const [updatedImageSrc, setImageSrc] = useState<string|null>(null);

	const refreshImage = async () => {
		if(updatedImageSrc) return; // already refreshed once, give up

		const res = await fetch(`/api/avatar?publicKey=${user.publicKey}`);
		if(res.status === 200) {
			const data = await res.json()
			setImageSrc(data.profileImage)
		}
	}

	return (
		<a
			href={`https://twitter.com/${user.twitterHandle}`}
			className="inline-block relative h-6 w-6 bg-gray-200 rounded-full text-center text-gray-400 overflow-hidden border border-gray-200 flex-none"
		>
			<Image
				className="absolute w-full h-full top-0 left-0"
				layout="fill"
				onError={refreshImage}
				src={updatedImageSrc ?? user.twitterProfileImage}
				alt={user.twitterHandle}
			/>
		</a>
	)
}