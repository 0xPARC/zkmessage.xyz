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
import { PageNav } from "components/PageNav"
import { UserList } from "components/UserList"

interface IndexPageProps extends PageProps {
	currentPage: number
	threadCount: number
	userCount: number
	defaultUsers: User[]
	vKeys: VKeys
	threads: (Thread & {
		firstMessage: Message
		messageCount: number
		group: User[]
	})[]
}

const threadPageSize = 20
const defaultUserLimit = 20

export const getServerSideProps: GetServerSideProps<IndexPageProps, {}> =
	async (ctx) => {
		const { publicKey } = nookies.get(ctx)

		const defaultUsers = await prisma.user.findMany({
			// afaikt this should work but doesn't...
			// orderBy: { threads: { _count: "desc" } },
			select: userProps,
			take: defaultUserLimit,
		})

		const userCount = await prisma.user.count()

		const page =
			typeof ctx.query.page === "string" ? parseInt(ctx.query.page) : NaN

		const threads = await prisma.thread.findMany({
			take: threadPageSize,
			skip: isNaN(page) ? 0 : (page - 1) * threadPageSize,
			orderBy: { updatedAt: "desc" },
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

		const threadCount = await prisma.thread.count()

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
		const currentPage = isNaN(page) ? 1 : page
		if (publicKey === undefined) {
			return {
				props: {
					vKeys,
					user: null,
					threads: serializedThreads,
					defaultUsers,
					userCount,
					currentPage,
					threadCount,
				},
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
				props: {
					vKeys,
					user,
					threads: serializedThreads,
					defaultUsers,
					userCount,
					currentPage,
					threadCount,
				},
			}
		}
	}

export default function IndexPage(props: IndexPageProps) {
	const lastPage = Math.ceil(props.threadCount / threadPageSize)

	return (
		<div className="max-w-4xl m-auto px-4 font-mono">
			<Header />
			<div className="grid grid-cols-4 gap-6 pt-2 pb-14">
				<div className="col-span-3 flex flex-col gap-4">
					<CreateThread defaultUsers={props.defaultUsers} />
					{props.threads.map((thread) => (
						<ThreadView key={thread.id} vKeys={props.vKeys} thread={thread} />
					))}
					<PageNav currentPage={props.currentPage} lastPage={lastPage} />
				</div>
				<div className="col-span-1 flex flex-col gap-2">
					<About />
					<div className="p-4 bg-white rounded-lg flex flex-col gap-4">
						<UserList users={props.defaultUsers} />
						<a href="/users" className="hover:underline self-end">
							all users
						</a>
					</div>
				</div>
			</div>
		</div>
	)
}
