import React, { useEffect, useMemo, useState } from "react"
import { Buffer } from "buffer"
import type { GetServerSideProps } from "next"
import Link from "next/link"
import { Tab } from "@headlessui/react"

import { prove } from "utils/prove"
import { prisma } from "utils/prisma"
import { LOCAL_STORAGE_SECRET_KEY } from "utils/localStorage"
import { useRouter } from "next/router"
import { Header } from "components/Header"

import Messages from "components/Messages"
import NewGroup from "components/NewGroup"

interface IndexPageProps {
	userCount: number
}

export const getServerSideProps: GetServerSideProps<IndexPageProps, {}> =
	async (context) => {
		const userCount = await prisma.user.count()
		return {
			props: { userCount },
		}
	}

export default function Index(props: IndexPageProps) {
	console.log("we have", props.userCount, "users")

	const router = useRouter()

	useEffect(() => {
		const secret = localStorage.getItem(LOCAL_STORAGE_SECRET_KEY)
		if (secret === null) {
			// user doesn't have a secret key in localstorage
			router.push("/login")
		}
	}, [])

	const [secret, setSecret] = useState("")

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

	return (
		<div className="max-w-lg m-auto font-mono">
			<div className="flex">
				<Header />
				<div>
					<Link href="/login">
						<div className="cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-14">
							Login
						</div>
					</Link>
				</div>
			</div>
			<Tab.Group>
				<Tab.List>
					<Tab>Messages</Tab>
					<Tab>New Group</Tab>
					<Tab>Users</Tab>
				</Tab.List>
				<Tab.Panels>
					<Tab.Panel>
						<Messages secret={secret} messages={messages} />
					</Tab.Panel>
					<Tab.Panel>
						<NewGroup secret={secret} />
					</Tab.Panel>
					<Tab.Panel>TBD</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</div>
	)
}
