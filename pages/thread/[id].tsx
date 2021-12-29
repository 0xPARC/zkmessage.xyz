import type { GetServerSideProps } from "next"
import React, { useContext, useMemo } from "react"

import nookies from "nookies"

import { prisma } from "utils/server/prisma"
import { getVKeys } from "utils/server/vkeys"
import { PageContext } from "utils/context"
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

import { Header } from "components/Header"
import { MessageView } from "components/MessageView"
import { CreateMessage } from "components/CreateMessage"
import { PageNav } from "components/PageNav"
import { UserList } from "components/UserList"

type ThreadPageParams = { id: string }

interface ThreadPageProps extends PageProps {
	vKeys: VKeys
	thread: Thread
	group: User[]
	messages: Message[]
	currentPage: number
	messageCount: number
}

const messagePageSize = 20

export const getServerSideProps: GetServerSideProps<
	ThreadPageProps,
	ThreadPageParams
> = async (ctx) => {
	if (ctx.params === undefined) {
		return { notFound: true }
	}

	const { publicKey } = nookies.get(ctx, "publicKey")

	const page =
		typeof ctx.query.page === "string" ? parseInt(ctx.query.page) : NaN

	const thread = await prisma.thread.findUnique({
		where: { id: ctx.params.id },
		select: {
			...threadProps,
			group: { select: userProps },
			messages: {
				take: messagePageSize,
				skip: isNaN(page) ? 0 : (page - 1) * messagePageSize,
				orderBy: { createdAt: "asc" },
				select: messageProps,
			},
			_count: {
				select: { messages: true },
			},
		},
	})

	if (thread === null) {
		return { notFound: true }
	}

	const { id, createdAt, updatedAt, group, messages } = thread
	const messageCount = thread._count.messages

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
	const currentPage = isNaN(page) ? 1 : page
	if (publicKey === undefined) {
		return {
			props: {
				vKeys,
				user: null,
				thread: serializedThread,
				group,
				messages: serializedMessages,
				currentPage,
				messageCount,
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
				currentPage,
				messageCount,
			},
		}
	}
}

export default function ThreadPage(props: ThreadPageProps) {
	const { user } = useContext(PageContext)
	const userInGroup = useMemo(
		() =>
			user !== null &&
			props.group.some(({ publicKey }) => user.publicKey === publicKey),
		[user]
	)

	const lastPage = Math.ceil(props.messageCount / messagePageSize)

	return (
		<div className="max-w-4xl m-auto px-4 font-mono">
			<Header />
			<div className="grid grid-cols-4 gap-6 pt-2 pb-14">
				<div className="col-span-3 flex flex-col gap-4">
					{props.messages.map((message) => (
						<MessageView
							key={message.id}
							vKeys={props.vKeys}
							group={props.group}
							message={message}
						/>
					))}
					{props.currentPage === lastPage && (
						<CreateMessage thread={props.thread} group={props.group} />
					)}
					<PageNav currentPage={props.currentPage} lastPage={lastPage} />
				</div>
				<div className="col-span-1">
					<div className="p-4 bg-white rounded-lg">
						<div className="mb-4">in this thread</div>
						<UserList users={props.group} />
					</div>
				</div>
			</div>
		</div>
	)
}
