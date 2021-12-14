import type { GetServerSideProps } from "next"
import React, { useContext } from "react"

import nookies from "nookies"

import { prisma } from "utils/server/prisma"
import {
	Message,
	messageProps,
	PageProps,
	Thread,
	threadProps,
	User,
	userProps,
	VKeys,
} from "utils/types"
import { getVKeys } from "utils/server/vkeys"
import { Header } from "components/Header"
import { About } from "components/About"
import { MessageView } from "components/MessageView"
import { UserIcon } from "components/UserIcon"

import { CreateMessage } from "components/CreateMessage"

type ThreadPageParams = { id: string }

interface ThreadPageProps extends PageProps {
	vKeys: VKeys
	thread: Thread
	group: User[]
	messages: Message[]
}

export const getServerSideProps: GetServerSideProps<
	ThreadPageProps,
	ThreadPageParams
> = async (ctx) => {
	if (ctx.params === undefined) {
		return { notFound: true }
	}

	const { publicKey } = nookies.get(ctx, "publicKey")

	const thread = await prisma.thread.findUnique({
		where: { id: ctx.params.id },
		select: {
			...threadProps,
			group: { select: userProps },
			messages: { select: messageProps },
		},
	})

	if (thread === null) {
		return { notFound: true }
	}

	const { id, createdAt, updatedAt, group, messages } = thread

	const serializedThread = {
		id,
		createdAt: createdAt.toISOString(),
		updatedAt: updatedAt.toISOString(),
	}

	const serializedMessages = messages.map(
		({ createdAt, publicSignals, proof, ...message }) => ({
			...message,
			proof: proof as {},
			publicSignals: publicSignals as string[],
			createdAt: createdAt.toISOString(),
		})
	)

	const vKeys = getVKeys()
	if (publicKey === undefined) {
		return {
			props: {
				vKeys,
				user: null,
				thread: serializedThread,
				group,
				messages: serializedMessages,
			},
		}
	} else {
		const user = await prisma.user.findUnique({
			where: { publicKey },
			select: userProps,
		})

		if (user === null) {
			nookies.destroy(ctx, "publicKey", { path: "/", httpOnly: true })
		}

		return {
			props: {
				vKeys,
				user,
				thread: serializedThread,
				group,
				messages: serializedMessages,
			},
		}
	}
}

export default function ThreadPage(props: ThreadPageProps) {
	return (
		<div className="max-w-4xl m-auto px-4 font-mono">
			<Header />
			<div className="grid grid-cols-4 gap-6 pt-2 pb-14">
				<div className="col-span-3">
					<div className="bg-white rounded-lg flex gap-x-2">
						{props.group.map((user) => (
							<div
								key={user.publicKey}
								className="bg-gray-200 rounded flex items-center gap-x-2 text-sm py-1 px-2 m-2"
							>
								<UserIcon user={user} /> {user.twitterHandle}
							</div>
						))}
					</div>
					{props.messages.map((message) => (
						<MessageView
							key={message.id}
							vKeys={props.vKeys}
							group={props.group}
							message={message}
						/>
					))}
					<CreateMessage thread={props.thread} group={props.group} />
				</div>
				<div className="col-span-1">
					<About />
				</div>
			</div>
		</div>
	)
}
