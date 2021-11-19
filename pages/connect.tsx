import React, { useRef } from "react"
import { Header } from "components/Header"

export default function ConnectPage(props: {}) {
	const twitterRef = useRef()
	const token =
		"4ecce3f8da39753fb31fac6c5f4061efb1337f0ef768f19a8b56df4cfb2aafeb"
	return (
		<div className="max-w-lg m-auto font-mono">
			<Header />
			<div className="border border-gray-300 rounded-xl p-6">
				<div>
					Verify ownership of your secret token by posting a signed message to
					Twitter:
				</div>
				<input
					className="block w-full rounded-xl px-4 py-2 mt-6"
					type="text"
					placeholder="@SatoshiNakamoto"
					ref={twitterRef}
				/>
				<input
					className="block w-full cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-6"
					type="button"
					value="Sign and post to Twitter"
					onClick={() => {
						console.log(twitterRef.current.value)
					}}
				/>
			</div>
		</div>
	)
}
