import { useMemo, useState } from "react"
import { mimcHash } from "utils/mimc"
import { Menu, Transition } from "@headlessui/react"
import UserIcon from "./UserIcon"

export default function Messages({ secret, messages }) {
	return (
		<>
			<div className="pt-6 pb-6">
				<div className="flex">
					<input
						type="text"
						className="rounded-xl px-4 py-3 mr-3 flex-1 !font-monospace outline-none"
						placeholder="Type your message here"
					/>
					<input
						className="cursor-pointer hover:bg-midpink bg-pink text-white rounded-xl px-4 py-2"
						type="button"
						value="Send"
						onClick={() => null /* prove, then send to server */}
					/>
				</div>
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
