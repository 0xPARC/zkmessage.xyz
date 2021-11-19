import React from "react"
import { Header } from "./index"

export default function ConnectPage(props: {}) {
	return (
		<div className="max-w-lg m-auto font-mono">
			<Header />
			<div className="border border-gray-300 rounded-xl p-6">
				<div>Sign this message with your Ethereum wallet:</div>
				<button>Sign in with Ethereum</button>
			</div>
		</div>
	)
}
