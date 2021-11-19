import { useState } from "react"
import { Menu, Transition } from "@headlessui/react"
import UserIcon from "./UserIcon"
import { User, Message } from "../utils/types"
import { prove, revealOrDeny } from "../utils/prove"
import api from "next-rest/client"

async function clickReveal(secret: string, hash: string, message: Message) {
	// If reveal is clicked, then verify that user has indeed revealed.
	// If the proof fails, then surface an alert that reveal failed.
	// If the proof succeeds, then send ZK proof to backend that reveal succeeded,
	// which should be reflected in the frontend.
	console.log(`Attempting to generate proof & verify reveal.`)
	const isValidProof = await revealOrDeny(
		true,
		secret,
		hash,
		message.message,
		message.messageAttestation
	)
	if (isValidProof) {
		// Send the proof to the DB & store it. Update the lists of users on the deny side.
		// Make sure page gets refreshed.
		alert("Valid reveal!")
	} else {
		alert("You cannot reveal as having written this message! Did you write it?")
	}
}

async function clickDeny(secret: string, hash: string, message: Message) {
	console.log(`Attempting to generate proof & verify deny.`)
	const isValidProof = await revealOrDeny(
		false,
		secret,
		hash,
		message.message,
		message.messageAttestation
	)
	if (isValidProof) {
		// Send the proof to the DB & store it. Update the lists of users on the deny side.
		// Make sure page gets refreshed.
		alert("Valid deny!")
	} else {
		alert("You cannot deny this message! Perhaps you wrote it? :) Oops...")
	}
}

async function clickSendMessage(
	secret: string,
	hashes: string[],
	messageBody: string
) {
	if (!messageBody || messageBody === "") {
		alert("You can't send a blank message!")
		return
	}
	console.log(
		`Generating proof for message ${messageBody} with secret ${secret}, hashes ${hashes}`
	)
	const { proof, publicSignals, verified } = await prove(
		secret,
		hashes,
		messageBody
	)
	// const verification = await verify('/hash.vkey.json', { proof, publicSignals });
	console.log("Verification is: ", verified)
	if (verified) {
		api.post("/api/messages", {
			params: {},
			headers: { "content-type": "application/json" },
			body: {
				group: hashes,
				msgBody: messageBody,
				proof: proof,
				publicSignals: publicSignals,
				msgAttestation: publicSignals[0],
			},
		})
	} else {
		alert("We could not verify your message!")
	}
}

const HASH_ARR_SIZE = 40

export default function Messages({
	publicKey,
	secret,
	messages,
	selectedUsers,
}: {
	publicKey: string
	secret: string
	messages: Message[]
	selectedUsers: User[]
}) {
	const [newMessage, setNewMessage] = useState("")

	return (
		<>
			<div className="pt-1 pb-6">
				<form
					className="flex"
					onSubmit={(e) => {
						e.preventDefault()
					}}
				>
					<input
						disabled={!secret}
						type="text"
						className={`rounded-xl px-4 py-3 mr-3 flex-1 !font-monospace outline-none bg-white ${
							secret ? "" : "placeholder-light"
						}`}
						placeholder={
							secret ? "Type your message here" : "Login to send a message"
						}
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
					/>
					<input
						disabled={!secret}
						className={`text-white rounded-xl px-4 py-2 ${
							secret ? "cursor-pointer bg-pink hover:bg-midpink" : "bg-gray-200"
						}`}
						type="submit"
						value="Send"
						onClick={(e) => {
							const hashes = (selectedUsers || [])
								.map((user) => user.hash)
								.filter((h) => h !== publicKey)
								.concat([publicKey])
							hashes.sort((a, b) => a.localeCompare(b))
							clickSendMessage(secret, hashes, newMessage)
						}}
					/>
				</form>
			</div>
			{messages.map((message, index) => (
				<div
					key={index}
					className="bg-white rounded-2xl px-6 pt-5 pb-4 mb-4 leading-snug relative"
				>
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
											<input
												className={`block ${
													active && "bg-blue-500 text-white"
												}`}
												type="button"
												value="Reveal"
												onClick={(e) => clickReveal(secret, publicKey, message)}
											/>
										)}
									</Menu.Item>
									<Menu.Item>
										{({ active }) => (
											<input
												className={`block ${
													active && "bg-blue-500 text-white"
												}`}
												type="button"
												value="Deny"
												onClick={(e) => clickDeny(secret, publicKey, message)}
											/>
										)}
									</Menu.Item>
								</Menu.Items>
							</Transition>
						</Menu>
					</div>
					<div className="mb-5">{message.msgBody}</div>
					<div className="flex text-sm">
						<div className="flex-1 text-gray-400">
							{message.reveal ? "From " : "From one of "}
							{message.reveal ? (
								<UserIcon key={r.userPublicKey} address={r.userPublicKey} />
							) : (
								message.group.map((u) => (
									<UserIcon key={u.publicKey} address={u.publicKey} />
								))
							)}
						</div>
						<div className="text-right text-gray-400">
							{message.reveal && "Not from "}
							{message.deny?.map((d) => (
								<UserIcon key={d.userPublicKey} address={d.userPublicKey} />
							))}
						</div>
					</div>
				</div>
			))}
		</>
	)
}
