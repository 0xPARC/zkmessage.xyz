import React, { useEffect, useMemo, useState } from "react"
import { Buffer } from "buffer"
import type { GetServerSideProps } from "next"
import Link from "next/link"

import { mimcHash } from "utils/mimc"
import { getVKey } from "utils/vkey"
import { prisma } from "utils/prisma"
import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"
import { useRouter } from "next/router"
import { Header } from "components/Header"

import Messages from "components/Messages"
import UserIcon from "components/UserIcon"

interface IndexPageProps {
	users: User[]
	messages: Message[]
}

type Message = {
	id: string
	// createdAt: string
	group: User[]
	msgBody: string
	serializedProof: string
	serializedPublicSignals: string
	msgAttestation: string
	reveal: {
		id: string
		serializedProof: string
		userPublicKey: string
	} | null
	deny: {
		id: string
		serializedProof: string
		userPublicKey: string
	}[]
}

type User = {
	publicKey: string
	twitterHandle: string
	verificationTweetId: string
}

// const messages = [
// 	{
// 		message: "Hello world!",
// 		proof: "",
// 		group: ["0", "1", "2"],
// 		reveals: [],
// 		denials: [],
// 	},
// 	{
// 		message:
// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempo",
// 		proof: "",
// 		group: ["0", "1", "2"],
// 		reveals: ["0"],
// 		denials: ["1", "2"],
// 	},
// 	{
// 		message: "Random message",
// 		proof: "",
// 		group: ["0", "1", "2"],
// 		reveals: [],
// 		denials: [],
// 	},
// ]

export const getServerSideProps: GetServerSideProps<IndexPageProps, {}> =
	async (context) => {
		const users = await prisma.user.findMany({
			select: {
				publicKey: true,
				twitterHandle: true,
				verificationTweetId: true,
			},
		})

		const messages = await prisma.message.findMany({
			select: {
				id: true,
				msgBody: true,
				serializedProof: true,
				serializedPublicSignals: true,
				msgAttestation: true,
				group: {
					select: {
						publicKey: true,
						twitterHandle: true,
						verificationTweetId: true,
					},
				},
				reveal: {
					select: {
						id: true,
						// createdAt: true,
						serializedProof: true,
						userPublicKey: true,
					},
				},
				deny: {
					select: {
						id: true,
						// createdAt: true,
						serializedProof: true,
						userPublicKey: true,
					},
				},
			},
		})

		return {
			props: { users, messages },
		}
	}

interface UsersProps {
	publicKey: string | null
	secret: string | null
	users: User[]
	handleUpdateSelectedUsers: (selectedUsers: string[]) => void
}

function Users({
	publicKey,
	secret,
	users,
	handleUpdateSelectedUsers,
}: UsersProps) {
	// this is a map from public keys to twitter handles
	const twitterHandles = useMemo(
		() =>
			Object.fromEntries(
				users.map((user) => [user.publicKey, user.twitterHandle])
			),
		[users]
	)

	const [selectedUsers, setSelectedUsers] = useState<string[]>([])

	return (
		<>
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
						<UserIcon address={user.twitterHandle} />
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
					{secret && (
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
								handleUpdateSelectedUsers(selectedUsers)
							}}
						/>
					)}
				</div>
			))}
		</>
	)
}

export default function IndexPage({ users, messages }: IndexPageProps) {
	const [secret, setSecret] = useState<null | string>(null)
	const [publicKey, setPublicKey] = useState<null | string>(null)

	// this is an array of public keys
	const [selectedUsers, setSelectedUsers] = useState<string[]>([])

	useEffect(() => {
		const localSecret = localStorage.getItem(LOCAL_STORAGE_SECRET_KEY)
		setSecret(localSecret)
		if (localSecret !== null) {
			const n = BigInt("0x" + localSecret)
			setPublicKey(mimcHash(n).toString(16))
		}
	}, [])

	return (
		<div className="max-w-4xl m-auto font-mono">
			<Header />
			<div className="grid grid-cols-4 gap-6 pt-2">
				<div className="col-span-3">
					{messages && (
						<Messages
							publicKey={publicKey}
							secret={secret}
							messages={messages}
							selectedUsers={selectedUsers}
						/>
					)}
				</div>
				<div className="col-span-1">
					<Users
						publicKey={publicKey}
						secret={secret}
						users={users}
						handleUpdateSelectedUsers={setSelectedUsers}
					/>
				</div>
			</div>
		</div>
	)
}
