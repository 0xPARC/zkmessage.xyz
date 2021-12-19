import React, { useCallback, useState } from "react"

import moment from "moment"

import type { Message, User, VKeys } from "utils/types"
import { verifyMessage } from "utils/client/prove"

interface MessageViewProps {
	vKeys: VKeys
	group: User[]
	message: Message
}

export function MessageView(props: MessageViewProps) {
	const [verified, setVerified] = useState<null | boolean>(null)

	const handleVerify = useCallback(async () => {
		const verified = await verifyMessage(props.vKeys, props.message)
		setVerified(verified)
	}, [])

	return (
		<div className="px-4 pt-4 pb-2 bg-white rounded-lg">
			<div>{props.message.body}</div>
			<div className="mt-2 flex gap-1 items-baseline">
				<div className="flex-1 text-sm text-gray-400 ">
					{moment(props.message.createdAt).fromNow()}
				</div>
				<button
					className={
						verified === null
							? "pt-1 pb-0.5 px-2 rounded text-sm bg-gray-100"
							: verified === true
							? "pt-1 pb-0.5 px-2 rounded text-sm bg-green-100 cursor-default"
							: "pt-1 pb-0.5 px-2 rounded text-sm bg-red-100 cursor-default"
					}
					disabled={verified !== null}
					onClick={handleVerify}
				>
					{verified === null
						? "Verify"
						: verified === true
						? "Valid ✅"
						: "Invalid 🚨"}
				</button>
			</div>
		</div>
	)

	// return (
	// 	<div className="bg-white rounded-2xl px-6 pt-5 pb-4 mb-4 leading-snug relative">
	// 		<div className="absolute top-3 right-5 text-right">
	// 			<button
	// 				className="bg-gray-100 mt-2 py-1.5 pb-0.5 px-2 rounded-lg text-sm"
	// 				onClick={() => handleVerify()}
	// 			>
	// 				Verify
	// 			</button>
	// 		</div>
	// 		<div className="mb-20">{message.body}</div>
	// 		<div className="flex text-sm">
	// 			<div className="flex-1 text-gray-400">
	// 				{group.length === 1 ? "From " : "From one of "}
	// 				<div className="inline-block relative top-1.5">
	// 					{group.map((user, index) => (
	// 						<UserIcon key={index} user={user} />
	// 					))}
	// 				</div>
	// 			</div>
	// 		</div>
	// 		<div className="flex">
	// 			<div className="flex-1 text-right text-sm text-gray-400 mt-3">
	// 				{moment(message.createdAt).fromNow()}
	// 			</div>
	// 		</div>
	// 	</div>
	// )
}
