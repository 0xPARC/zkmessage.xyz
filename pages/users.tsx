import React from "react"
import type { GetServerSideProps } from "next"

import nookies from "nookies"
import { PageProps, User, userProps } from "utils/types"
import { prisma } from "utils/server/prisma"
import { UserIcon } from "components/UserIcon"

interface UsersPageProps extends PageProps {
	users: User[]
}

const pageSize = 100

export const getServerSideProps: GetServerSideProps<UsersPageProps, {}> =
	async (ctx) => {
		const { publicKey } = nookies.get(ctx)
		const { after } = ctx.query

		const cursor =
			typeof after === "string" ? { cursor: { publicKey: after } } : null

		const users = await prisma.user.findMany({
			select: userProps,
			take: pageSize,
			orderBy: { publicKey: "asc" },
			skip: typeof after === "string" ? 1 : 0,
			...cursor,
		})

		if (publicKey === undefined) {
			return { props: { user: null, users } }
		} else {
			const user = await prisma.user.findUnique({
				where: { publicKey },
				select: userProps,
			})

			if (user === null) {
				nookies.destroy(ctx, "publicKey", { path: "/", httpOnly: true })
			}

			return { props: { user, users } }
		}
	}

export default function UsersPage(props: UsersPageProps) {
	const cursor: User | undefined = props.users[pageSize - 1]

	return (
		<div className="mt-16 max-w-lg m-auto font-mono">
			<div className="m-2 border bg-white rounded-xl p-6 flex flex-col gap-2">
				{props.users.map((user) => (
					<div key={user.publicKey} className="flex gap-2 items-center">
						<UserIcon user={user} />
						<a
							className="mt-0.5 hover:underline flex-1"
							href={`https://twitter.com/${user.twitterHandle}`}
						>
							{user.twitterHandle}
						</a>
						<a
							href={`https://twitter.com/${user.twitterHandle}/status/${user.verificationTweetId}`}
						>
							<img
								width={16}
								src="/key.svg"
								className="inline-block opacity-20 hover:opacity-70"
							/>
						</a>
					</div>
				))}
				{cursor && (
					<a
						href={`?after=${cursor.publicKey}`}
						className="self-end hover:underline"
					>
						next
					</a>
				)}
			</div>
		</div>
	)
}
