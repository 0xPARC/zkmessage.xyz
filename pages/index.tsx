import React from "react"
import type { GetServerSideProps } from "next"

import {
	userProps,
	threadProps,
	Thread,
	PageProps,
	messageProps,
	Message,
	User,
	VKeys,
} from "utils/types"

import { prisma } from "utils/server/prisma"

import nookies from "nookies"

import { Header } from "components/Header"
import { CreateThread } from "components/CreateThread"
import { ThreadView } from "components/ThreadView"
import { getVKeys } from "utils/server/vkeys"
import { About } from "components/About"

interface IndexPageProps extends PageProps {
	defaultUsers: User[]
	vKeys: VKeys
	threads: (Thread & {
		firstMessage: Message
		messageCount: number
		group: User[]
	})[]
}

export const getServerSideProps: GetServerSideProps<IndexPageProps, {}> =
	async (ctx) => {
		const { publicKey } = nookies.get(ctx)

		const defaultUsers = await prisma.user.findMany({
			// orderBy: { threads: { _count: "desc" } },
			select: userProps,
			take: 20,
		})

		const threads = await prisma.thread.findMany({
			take: 20,
			orderBy: { createdAt: "desc" },
			where: { firstMessageId: { not: null } },
			select: {
				...threadProps,
				group: { select: userProps },
				firstMessage: { select: messageProps },
				_count: {
					select: { messages: true },
				},
			},
		})

		const serializedThreads = threads.map(
			({ createdAt, updatedAt, firstMessage, _count, ...thread }) => ({
				id: thread.id,
				createdAt: createdAt.toISOString(),
				updatedAt: updatedAt.toISOString(),
				group: thread.group,
				firstMessage: {
					...firstMessage!,
					createdAt: firstMessage!.createdAt.toISOString(),
					proof: firstMessage!.proof as {},
					publicSignals: firstMessage!.publicSignals as string[],
				},
				messageCount: _count.messages,
			})
		)

		const vKeys = getVKeys()
		if (publicKey === undefined) {
			return {
				props: { vKeys, user: null, threads: serializedThreads, defaultUsers },
			}
		} else {
			const user = await prisma.user.findUnique({
				where: { publicKey },
				select: userProps,
			})

			if (user === null) {
				nookies.destroy(ctx, "publicKey")
			}

			return {
				props: { vKeys, user, threads: serializedThreads, defaultUsers },
			}
		}
	}

export default function IndexPage(props: IndexPageProps) {
	return (
		<div className="max-w-4xl m-auto px-4 font-mono">
			<Header />
			<div className="grid grid-cols-4 gap-6 pt-2 pb-14">
				<div className="col-span-3">
					<CreateThread defaultUsers={props.defaultUsers} />
					{props.threads.map((thread) => (
						<ThreadView key={thread.id} vKeys={props.vKeys} thread={thread} />
					))}
				</div>
				<div className="col-span-1">
					<About />
				</div>
			</div>
		</div>
	)
}
