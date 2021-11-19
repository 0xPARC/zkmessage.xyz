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
import UserIcon from "components/UserIcon"

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

function Users({ users }) {
	return (
		<>
			{users.map((u) => (
				<div className="block mb-1 flex">
					<UserIcon address={u.handle} />
					<div className="flex-1 ml-2 pt-0.5">{u.handle}</div>
				</div>
			))}
		</>
	)
}

export default function Index(props: IndexPageProps) {
	console.log("we have", props.userCount, "users")

	const router = useRouter()

	// useEffect(() => {
	// 	const secret = localStorage.getItem(LOCAL_STORAGE_SECRET_KEY)
	// 	if (secret === null) {
	// 		// user doesn't have a secret key in localstorage
	// 		router.push("/login")
	// 	}
	// }, [])

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

	return (
		<div className="max-w-lg m-auto font-mono">
			<Header />
			<Tab.Group>
				<Tab.List>
					<Tab>Messages</Tab>
					<Tab>New Group</Tab>
					<Tab>Users</Tab>
				</Tab.List>
				<Tab.Panels>
					<Tab.Panel>
						<Messages messages={messages} />
					</Tab.Panel>
					<Tab.Panel>
						<NewGroup />
					</Tab.Panel>
					<Tab.Panel>
						<Users users={users} />
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</div>
	)
}
