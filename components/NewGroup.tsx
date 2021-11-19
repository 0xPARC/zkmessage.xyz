import { useMemo, useState } from "react"
import { mimcHash } from "utils/mimc"

export default function NewGroup({ secret }) {
	const hash1 = useMemo(() => {
		const hex = Buffer.from(secret).toString("hex")
		const i = hex ? BigInt("0x" + hex) : 0n
		const hash = mimcHash(i)
		return hash.toString(16)
	}, [secret])

	const [hash2, setHash2] = useState("")
	const [hash3, setHash3] = useState("")

	const [message, setMessage] = useState("")

	return (
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
					className="bg-pink text-white rounded-xl px-4 py-2 mt-6"
					type="button"
					onClick={() => prove({ secret, hash1, hash2, hash3, msg: message })}
					value="Send your first message"
				/>
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
	)
}
