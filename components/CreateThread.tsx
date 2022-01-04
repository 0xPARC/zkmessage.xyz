import React, { useCallback, useContext, useEffect, useState } from "react"

import { useRouter } from "next/router"

import { SelectGroup } from "./SelectGroup"

import { hashMessage } from "utils/mimc"
import { PageContext } from "utils/context"
import { sign } from "utils/client/prove"
import { User } from "utils/types"

interface CreateThreadProps {
	defaultUsers: User[]
}

export const CreateThread: React.FC<CreateThreadProps> = (props) => {
	const { user, secretKey } = useContext(PageContext)

	const [value, setValue] = useState("")
	const [group, setGroup] = useState(user ? [user] : [])

	useEffect(() => {
		if (user === null) {
			setGroup([])
			setValue("")
		}
	}, [user])

	const router = useRouter()

	const handleSubmit = useCallback(async () => {
		if (secretKey === null) {
			return
		}

		const { proof, publicSignals } = await sign(secretKey, group, value)

		const message = {
			body: value,
			hash: hashMessage(value).toString(16),
			proof,
			publicSignals,
		}

		const res = await fetch("/api/threads", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				group: group.map((user) => user.publicKey),
				firstMessage: message,
			}),
		})

		if (res.status === 200) {
			const location = res.headers.get("Location")
			if (location !== null) {
				router.push(location)
			}
		} else {
			alert("Failed to create thread 😭")
		}
	}, [secretKey, value, group, router])

	return (
		<div>
			<input
				className={
					user
						? "rounded-lg px-4 py-3 flex-1 bg-white"
						: "rounded-lg px-4 py-3 flex-1 bg-white placeholder-light"
				}
				disabled={user === null}
				type="text"
				placeholder={user ? "Type your message here" : "Login to post messages"}
				value={value}
				onChange={(event) => setValue(event.target.value)}
			/>
			<div className="flex my-2 gap-2">
				<div className="flex-1">
					<SelectGroup
						group={group}
						setGroup={setGroup}
						defaultUsers={props.defaultUsers}
					/>
				</div>
				<input
					className={
						user && value
							? "text-white rounded-lg px-4 pt-2 pb-1 cursor-pointer bg-pink hover:bg-midpink"
							: "text-white rounded-lg px-4 pt-2 pb-1 bg-gray-200"
					}
					type="button"
					value="Post"
					disabled={user === null || value === "" || group.length < 2}
					onClick={handleSubmit}
				/>
			</div>
		</div>
	)
}
