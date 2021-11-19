import React from "react"
import { Header } from "components/Header"

export default function ConnectPage(props: {}) {
	const token = "4ecce3f8da39753fb31fac6c5f4061efb1337f0ef768f19a8b56df4cfb2aafeb"
	return (
		<div className="max-w-lg m-auto font-mono">
			<Header />
			<div className="border border-gray-300 rounded-xl p-6">
				<div>Sign your secret token with your Ethereum address. This will link it to your public identity:</div>
				<input
					className="block w-full cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-6"
					type="button"
					value="Sign with Ethereum wallet"
					onClick={() => { }}
				/>
			</div>
		</div>
	)
}
