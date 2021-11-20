import { useState, useEffect } from "react"
import { Menu, Transition } from "@headlessui/react"
import api from "next-rest/client"

import { UserIcon } from "components/UserIcon"

import type { Message } from "utils/types"
import { prove, revealOrDeny, verify } from "utils/prove"
import { User } from "utils/types"

function lookupTwitterProfileImage(publicKey: string, users: User[]) {
	return users.find((u) => u.publicKey === publicKey)?.twitterProfileImage
}

async function clickReveal(secret: string, hash: string, message: Message) {
	// If reveal is clicked, then verify that user has indeed revealed.
	// If the proof fails, then surface an alert that reveal failed.
	// If the proof succeeds, then send ZK proof to backend that reveal succeeded,
	// which should be reflected in the frontend.
	console.log(`Attempting to generate proof & verify reveal.`)
	console.log(message)
	const { proof, publicSignals, verified } = await revealOrDeny(
		true,
		secret,
		hash,
		message.msgBody,
		message.msgAttestation
	)
	if (verified) {
		// Send the proof to the DB & store it. Update the lists of users on the deny side.
		// Make sure page gets refreshed.
		alert("Valid reveal!")
		api.post("/api/reveal", {
			params: {},
			headers: { "content-type": "application/json" },
			body: {
				userPublicKey: hash,
				messageId: message.id,
				proof: proof,
			},
		})
	} else {
		alert("You cannot reveal as having written this message! Did you write it?")
	}
}

async function clickDeny(secret: string, hash: string, message: Message) {
	console.log(`Attempting to generate proof & verify deny.`)
	const { proof, publicSignals, verified } = await revealOrDeny(
		false,
		secret,
		hash,
		message.msgBody,
		message.msgAttestation
	)
	if (verified) {
		// Send the proof to the DB & store it. Update the lists of users on the deny side.
		// Make sure page gets refreshed.
		alert("Valid deny!")
		api.post("/api/deny", {
			params: {},
			headers: { "content-type": "application/json" },
			body: {
				userPublicKey: hash,
				messageId: message.id,
				proof: proof,
			},
		})
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
		throw new Error("You can't send a blank message!")
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
		await api.post("/api/messages", {
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
		return { proof, publicSignals, attestation: publicSignals[0] }
	} else {
		alert("We could not verify your message!")
		throw new Error("We could not verify your message!")
	}
}

async function onMessageVerify(message: Message) {
	console.log("Attempting to verify message", message)
	//verifying the message itself
	const msgVerified = verify(
		"/sign.vkey.json",
		message.publicSignals,
		message.proof
	)
	if (!msgVerified) {
		alert(
			`The message with these public signals ${message.publicSignals} seems to be false!`
		)
		// if the message is false just go ahead and return false, no
		// point alerting about the other stuff
		return false
	}

	let isValid = true
	if (message.reveal) {
		const revealVerified = verify("/reveal.vkey.json", message.reveal.proof, {})
		if (!revealVerified) {
			alert(
				`The reveal associated with this message ${message.publicSignals} seems to be false!`
			)
			isValid = false
		}
	}
	if (message.deny.length > 0) {
		const denyVerifies = message.deny.map((deny) => {
			const denyVerified = verify("/deny.vkey.json", deny.proof, {})
			if (!denyVerified) {
				alert(
					`The deny ${deny} associated with this message ${message.publicSignals} seems to be false!`
				)
				isValid = false
			}
		})
	}

	return isValid
}

const HASH_ARR_SIZE = 40

interface MessagesProps {
	publicKey: string
	secret: string
	initialMessages: Message[]
	selectedUsers: {
		publicKey: string
		twitterHandle: string
		verificationTweetId: string
	}[]
	users: User[]
}

export default function Messages({
	publicKey,
	secret,
	initialMessages,
	selectedUsers,
	users,
}: MessagesProps) {
	const [newMessage, setNewMessage] = useState<string>("")

	const [messages, setMessages] = useState<Message[]>([])
	useEffect(() => {
		setMessages(initialMessages)
	}, [])

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
						value="Post"
						onClick={async (e) => {
							const hashes = (selectedUsers || [])
								.map((user) => user.publicKey)
								.filter((h) => h !== publicKey)
								.concat([publicKey])
							hashes.sort((a, b) => a.localeCompare(b))
							setNewMessage("")
							const { proof, publicSignals, attestation } =
								await clickSendMessage(secret, hashes, newMessage)
							setMessages(
								[
									{
										id: "",
										group: hashes,
										msgBody: newMessage,
										proof,
										publicSignals,
										msgAttestation: attestation,
										reveal: null,
										deny: [],
									},
								].concat(messages)
							)
						}}
					/>
				</form>
			</div>
			{messages.length === 0 && (
				<div className="text-gray-400">No messages yet</div>
			)}
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
							{message.reveal || message.group.length === 1
								? "From "
								: "From one of "}
							<div className="inline-block relative top-1.5">
								{message.reveal ? (
									<UserIcon
										key={message.reveal.userPublicKey}
										url={lookupTwitterProfileImage(
											message.reveal.userPublicKey,
											users
										)}
									/>
								) : (
									message.group.map((u) => (
										<UserIcon
											key={u}
											url={lookupTwitterProfileImage(u, users)}
										/>
									))
								)}
							</div>
						</div>
						<div className="text-right text-gray-400">
							{message.deny.length > 0 && "Not from "}
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
