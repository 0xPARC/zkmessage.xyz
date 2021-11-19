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

const users = [
	{
		handle: "zero",
		hash: "2b68833d258d2439328267662b1b2e0a3415ee3d70125bd5a28bf8d9020b8144",
	},
	{
		handle: "one",
		hash: "155c1ffe0caa4c8fa68bb34c4a7c8d6246bc87489993709231a3557fda128c4b",
	},
	{
		handle: "two",
		hash: "2edf7af3393ac06294c2b9e5bba4362048a48ef55cfaa64f6f4489d4ecc37cb5",
	},
]

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
		const userCount = await prisma.user.count()
		return {
			props: { userCount },
		}
	}

function Users({ secret, users, handleUpdateSelectedUsers }) {
	const [selectedUsers, setSelectedUsers] = useState([])

	return (
		<>
			{users.map((u) => (
				<div key={u.hash} className="block mb-1 flex">
					<label htmlFor={u.hash} className="flex-1 flex py-0.5 leading-tight">
						<UserIcon address={u.handle} />
						<div className="flex-1 ml-2 pt-1">{u.handle}</div>
					</label>
					{secret && (
						<input
							className="mt-2.5"
							type="checkbox"
							id={u.hash}
							onChange={() => {
								if (selectedUsers.indexOf(u.hash) === -1) {
									setSelectedUsers(selectedUsers.concat(u.hash))
								} else {
									setSelectedUsers(selectedUsers.filter((h) => h !== u.hash))
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
	const router = useRouter()
	const [secret, setSecret] = useState()
	const [selectedUsers, setSelectedUsers] = useState()

	console.log("we have", props.userCount, "users")

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
