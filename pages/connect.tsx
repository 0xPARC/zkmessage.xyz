import React from "react"

export default function ConnectPage(props: {}) {
	return (
		<div className="max-w-lg m-auto font-mono">
			<h1 className="uppercase font-bold pt-16 pb-6">zk chat</h1>
			<div className="border border-gray-300 rounded-xl p-6">
				<div>Sign this message with your Ethereum wallet:</div>
				<button>Sign in with Ethereum</button>
			</div>
		</div>
	)
}
