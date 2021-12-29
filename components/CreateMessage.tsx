import { useRouter } from "next/router"
import React, { useCallback, useContext, useMemo, useState } from "react"
import { sign } from "utils/client/prove"
import { PageContext } from "utils/context"
import { hashMessage } from "utils/mimc"
import { Thread, User } from "utils/types"

interface CreateMessageProps {
	thread: Thread
	group: User[]
}

export function CreateMessage(props: CreateMessageProps) {
	const { user, secretKey } = useContext(PageContext)
	const [value, setValue] = useState("")

	const router = useRouter()

	const handleSubmit = useCallback(async () => {
		if (secretKey === null) {
			return
		}

		const hash = hashMessage(value).toString(16)

		const { proof, publicSignals } = await sign(secretKey, props.group, value)

		const res = await fetch(`/api/threads/${props.thread.id}`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ body: value, hash, proof, publicSignals }),
		})

		if (res.status === 200) {
			router.reload()
		}
	}, [value, secretKey])

	const isUserInGroup = useMemo(
		() =>
			user && props.group.some(({ publicKey }) => user.publicKey === publicKey),
		[]
	)

	return (
		<div className="flex my-2 gap-2">
			<input
				className={
					isUserInGroup
						? "rounded-lg px-4 py-3 flex-1 bg-white"
						: "rounded-lg px-4 py-3 flex-1 bg-white placeholder-light"
				}
				disabled={!isUserInGroup}
				type="text"
				placeholder={
					isUserInGroup
						? "Reply"
						: "You must be logged in as a group member to reply"
				}
				value={value}
				onChange={(event) => setValue(event.target.value)}
			/>

			<input
				className={
					isUserInGroup
						? "text-white rounded-lg px-4 pt-2 pb-1 cursor-pointer bg-pink hover:bg-midpink"
						: "text-white rounded-lg px-4 pt-2 pb-1 bg-gray-200"
				}
				type="button"
				value="Post"
				disabled={!isUserInGroup}
				onClick={handleSubmit}
			/>
		</div>
	)
}
