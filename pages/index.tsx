import React, { useMemo, useState } from "react"
import { Buffer } from "buffer"
import type { GetServerSideProps } from "next"
import Link from "next/link"
import { Menu, Transition } from "@headlessui/react"

import { mimcHash } from "utils/mimc"
import { prove } from "utils/prove"
import { prisma } from "utils/prisma"

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

export function Header() {
	return <div className="flex-1 mt-16 mb-6">
		<Link href="/">
			<h1 className="inline-block cursor-pointer uppercase font-bold">zk chat</h1>
		</Link>
	</div>;
}
function UserIcon({ address }) {
	return <div className="inline-block h-6 w-6 bg-gray-200 rounded-full text-center text-gray-400 pt-0.5 ml-0.5">
		{address}
	</div>;
}
export default function Index(props: IndexPageProps) {
	console.log("we have", props.userCount, "users")

	const [secret, setSecret] = useState("")
	const hash1 = useMemo(() => {
		const hex = Buffer.from(secret).toString("hex")
		const i = hex ? BigInt("0x" + hex) : 0n
		const hash = mimcHash(i)
		return hash.toString(16)
	}, [secret])

	const [hash2, setHash2] = useState("")
	const [hash3, setHash3] = useState("")

	const [message, setMessage] = useState("")

	const messages = [
	  {
            message: 'Hello world!',
            proof: '',
            group: ['0', '1', '2'],
            reveals: [],
            denials: [],
          },
	  {
            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempo',
            proof: '',
            group: ['0', '1', '2'],
            reveals: ['0'],
            denials: ['1', '2'],
          },
	  {
            message: 'Random message',
            proof: '',
            group: ['0', '1', '2'],
            reveals: [],
            denials: [],
          }
	]

	return (
		<div className="max-w-lg m-auto font-mono">
			<div className="flex">
				<Header />
				<div>
					<Link href="/login">
						<div className="cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-14">Login</div>
					</Link>
				</div>
			</div>
			<div className="border border-gray-300 rounded-xl p-6">
			<fieldset>
				<legend>identify yourself</legend>
				<label>
					<span>secret pre-image</span>
					<br />
					<input
						type="text"
						value={secret}
						onChange={(event) => setSecret(event.target.value)}
					/>
				</label>
				<br />
				<label>
					<span>hash1</span>
					<br />
					<code>{hash1}</code>
				</label>
			</fieldset>
			<fieldset>
				<legend>identify your group</legend>
				<label>
					<span>hash2</span>
					<br />
					<input
						type="text"
						value={hash2}
						onChange={(event) => setHash2(event.target.value)}
					/>
				</label>
				<br />
				<label>
					<span>hash3</span>
					<br />
					<input
						type="text"
						value={hash3}
						onChange={(event) => setHash3(event.target.value)}
					/>
				</label>
			</fieldset>
			<fieldset>
				<legend>message</legend>
				<br />
				<textarea
					className="block w-full"
					value={message}
					onChange={(event) => setMessage(event.target.value)}
				/>
				<input
					className="cursor-pointer hover:bg-midpink bg-pink text-white rounded-xl px-4 py-2 mt-6"
					type="button"
					onClick={() => prove({ secret, hash1, hash2, hash3, msg: message })}
					value="Send your first message"
				/>
			</fieldset>
			</div>
			<div className="pt-6 pb-12">
				<div className="mb-8 flex">
					<input
						type="text"
						className="rounded-xl px-4 py-3 mr-3 flex-1 !font-monospace"
						placeholder="Type your message here"
					/>
					<input
						className="cursor-pointer hover:bg-midpink bg-pink text-white rounded-xl px-4 py-2"
						type="button"
						value="Send"
						onClick={() => null /* prove, then send to server */}
					/>
				</div>

				{messages.map((message, index) => (
					<div key={index} className="bg-white rounded-2xl px-6 pt-5 pb-4 mb-4 leading-snug relative">
					<div className="absolute top-3 right-5 text-right">
							<Menu>
								<Menu.Button className="text-gray-300">&hellip;</Menu.Button>
								<Transition
									enter="transition duration-100 ease-out"
									enterFrom="transform scale-95 opacity-0"
									enterTo="transform scale-100 opacity-100"
									leave="transition duration-75 ease-out"
									leaveFrom="transform scale-100 opacity-100"
									leaveTo="transform scale-95 opacity-0"
								>
									<Menu.Items className="mt-2">
										<Menu.Item>
											{({ active }) => (
												<a
													className={`block ${active && 'bg-blue-500 text-white'}`}
													href="#"
													onClick={(e) => e.preventDefault()}
												>
													Reveal
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													className={`block ${active && 'bg-blue-500 text-white'}`}
													href="#"
													onClick={(e) => e.preventDefault()}
												>
													Deny
												</a>
											)}
										</Menu.Item>
									</Menu.Items>
								</Transition>
							</Menu>
						</div>
						<div className="mb-5">
							{message.message}
						</div>
						<div className="flex text-sm">
							<div className="flex-1 text-gray-400">
								{message.reveals.length > 0 ? 'From ' : 'From one of '}
								{(message.reveals.length > 0 ? message.reveals : message.group).map((r) => <UserIcon address={r} />)}
							</div>
							<div className="text-right text-gray-400">
								{message.reveals.length > 0 && 'Not from '}
								{message.denials.map((r) => <UserIcon address={r} />)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
