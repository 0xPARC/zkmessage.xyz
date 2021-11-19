import React, { useEffect, useMemo, useState } from "react"
import { Buffer } from "buffer"
import type { GetServerSideProps } from "next"
import Link from "next/link"

import { mimcHash } from "utils/mimc"
import { prove, verify } from "utils/prove"
import { getVKey } from "utils/vkey"
import { prisma } from "utils/prisma"
import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"
import { useRouter } from "next/router"
import { Header } from "components/Header"

import Messages from "components/Messages"
import UserIcon from "components/UserIcon"

interface IndexPageProps {
	userCount: number
}

const messages = [
	{
		message: "Hello world!",
		proof: "",
		group: ["0", "1", "2"],
		reveals: [],
		denials: [],
	},
	{
		message:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempo",
		proof: "",
		group: ["0", "1", "2"],
		reveals: ["0"],
		denials: ["1", "2"],
	},
	{
		message: "Random message",
		proof: "",
		group: ["0", "1", "2"],
		reveals: [],
		denials: [],
	},
]

export const getServerSideProps: GetServerSideProps<IndexPageProps, {}> =
	async (context) => {
		const users = await prisma.user.findMany()
		return {
			props: { users },
		}
	}

function Users({ secret, users, handleUpdateSelectedUsers }) {
	const [selectedUsers, setSelectedUsers] = useState([])

	return (
		<>
			{users.map((u) => (
				<div key={u.publicKey} className="block mb-1 flex">
					<label
						htmlFor={u.publicKey}
						className="flex-1 flex py-0.5 leading-tight"
					>
						<UserIcon address={u.twitterHandle} />
						<a href={`https://twitter.com/${u.twitterHandle}`} target="_blank">
							<div className="flex-1 ml-2 pt-1 cursor-pointer hover:underline">
								{u.twitterHandle}
							</div>
						</a>
					</label>
					{secret && (
						<input
							className="mt-2.5"
							type="checkbox"
							id={u.publicKey}
							onChange={() => {
								if (selectedUsers.indexOf(u.publicKey) === -1) {
									setSelectedUsers(selectedUsers.concat(u.publicKey))
								} else {
									setSelectedUsers(
										selectedUsers.filter((h) => h !== u.publicKey)
									)
								}
								handleUpdateSelectedUsers(selectedUsers)
							}}
						/>
					)}
				</div>
			))}
		</>
	)
}

export default function Index(props: IndexPageProps) {
	const { users } = props
	const router = useRouter()
	const [secret, setSecret] = useState()
	const [selectedUsers, setSelectedUsers] = useState()

	useEffect(() => {
		setSecret(localStorage.getItem(LOCAL_STORAGE_SECRET_KEY))
	}, [])

	const handleUpdateSelectedUsers = (users) => {
		setSelectedUsers(users)
	}

	const messages = [
		{
			message: "Hello world!",
			messageAttestation: "",
			proof: "",
			group: ["0", "1", "2"],
			reveals: [],
			denials: [],
		},
		{
			message:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempo",
			messageAttestation: "",
			proof: "",
			group: ["0", "1", "2"],
			reveals: ["0"],
			denials: ["1", "2"],
		},
		{
			message: "Random message",
			messageAttestation: "",
			proof: "",
			group: ["0", "1", "2"],
			reveals: [],
			denials: [],
		},
	]

	return (
		<div className="max-w-4xl m-auto font-mono">
			<Header />
			<div className="grid grid-cols-4 gap-6 pt-2">
				<div className="col-span-3">
					<Messages
						secret={secret}
						messages={messages}
					/>
				</div>
				<div className="col-span-1">
					<Users
						secret={secret}
						users={users}
						handleUpdateSelectedUsers={handleUpdateSelectedUsers}
					/>
				</div>
			</div>
		</div>
	)
}
