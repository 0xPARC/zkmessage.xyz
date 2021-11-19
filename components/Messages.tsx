import { useMemo, useState, useRef } from "react"
import { mimcHash } from "utils/mimc"
import { Menu, Transition } from "@headlessui/react"
import UserIcon from "./UserIcon"

export default function Messages({ secret, messages, handleSend }) {
	const messageRef = useRef()

	return (
		<>
			<div className="pt-1 pb-6">
				<form
					className="flex"
					onSubmit={(e) => {
						e.preventDefault()
						handleSend(messageRef.current.value)
						messageRef.current.value = ""
					}}
				>
					<input
						disabled={!secret}
						type="text"
						ref={messageRef}
						className="rounded-xl px-4 py-3 mr-3 flex-1 !font-monospace outline-none bg-white placeholder-light"
						placeholder={secret ? "Type your message here" : "Log in to post"}
					/>
					<input
						disabled={!secret}
						className={`cursor-pointer text-white rounded-xl px-4 py-2 ${
							secret ? "bg-pink hover:bg-midpink" : "bg-gray-200"
						}`}
						type="submit"
						value="Send"
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
											<a
												className={`block ${
													active && "bg-blue-500 text-white"
												}`}
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
												className={`block ${
													active && "bg-blue-500 text-white"
												}`}
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
					<div className="mb-5">{message.message}</div>
					<div className="flex text-sm">
						<div className="flex-1 text-gray-400">
							{message.reveals.length > 0 ? "From " : "From one of "}
							{(message.reveals.length > 0
								? message.reveals
								: message.group
							).map((r) => (
								<UserIcon key={r} address={r} />
							))}
						</div>
						<div className="text-right text-gray-400">
							{message.reveals.length > 0 && "Not from "}
							{message.denials.map((r) => (
								<UserIcon key={r} address={r} />
							))}
						</div>
					</div>
				</div>
			))}
		</>
	)
}
