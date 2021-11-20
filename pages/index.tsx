import React, { useEffect, useMemo, useState } from "react"
import type { GetServerSideProps } from "next"

import { mimcHash } from "utils/mimc"
import { prisma } from "utils/prisma"
import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"
import { Header } from "components/Header"

import type { User, Message } from "utils/types"

import Messages from "components/Messages"
import { SelectUsers } from "components/SelectUsers"

interface IndexPageProps {
	users: User[]
	initialMessages: Message[]
}

export const getServerSideProps: GetServerSideProps<IndexPageProps, {}> =
	async (context) => {
		const users = await prisma.user.findMany({
			select: {
				publicKey: true,
				twitterHandle: true,
				verificationTweetId: true,
				twitterProfileImage: true,
			},
		})

		const messages = await prisma.message.findMany({
			select: {
				id: true,
				msgBody: true,
				// createdAt: true,
				serializedProof: true,
				serializedPublicSignals: true,
				msgAttestation: true,
				group: { select: { publicKey: true } },
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
			props: {
				users,
				initialMessages: messages.map((message) => ({
					group: message.group.map((user) => user.publicKey),
					id: message.id,
					msgBody: message.msgBody,
					msgAttestation: message.msgAttestation,
					proof: JSON.parse(message.serializedProof),
					publicSignals: JSON.parse(message.serializedPublicSignals),
					reveal: message.reveal && {
						...message.reveal,
						proof: JSON.parse(message.reveal.serializedProof),
					},
					deny: message.deny.map((deny) => ({
						...deny,
						proof: JSON.parse(deny.serializedProof),
					})),
				})),
			},
		}
	}

export default function IndexPage({ users, initialMessages }: IndexPageProps) {
	const [secret, setSecret] = useState<null | string>(null)
	const [publicKey, setPublicKey] = useState<null | string>(null)

	// this is a map from public keys to twitter handles
	const userMap = useMemo(
		() => Object.fromEntries(users.map((user) => [user.publicKey, user])),
		[users]
	)

	// this is an array of public keys
	const [selectedUsers, setSelectedUsers] = useState<string[]>([])

	useEffect(() => {
		const localSecret = localStorage.getItem(LOCAL_STORAGE_SECRET_KEY)
		setSecret(localSecret)
		if (localSecret !== null) {
			const n = BigInt("0x" + localSecret)
			console.log("logged in:", mimcHash(n).toString(16))
			setPublicKey(mimcHash(n).toString(16))
		}
	}, [])

	return (
		<div className="max-w-4xl m-auto font-mono">
			<Header />
			<div className="grid grid-cols-4 gap-6 pt-2">
				<div className="col-span-3">
					<Messages
						publicKey={publicKey}
						secret={secret}
						initialMessages={initialMessages}
						selectedUsers={selectedUsers.map((publicKey) => userMap[publicKey])}
					/>
				</div>
				<div className="col-span-1">
					<SelectUsers
						publicKey={publicKey}
						users={users}
						updateSelectedUsers={setSelectedUsers}
					/>
				</div>
			</div>
		</div>
	)
}
