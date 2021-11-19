import React, { useMemo, useState } from "react"
import { Buffer } from "buffer"

import { mimcHash } from "utils/mimc"
import { prove } from "utils/prove"

export default function Index(props: {}) {
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

	return (
		<main>
			<h1>zk-group-sigs-server</h1>
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
				<legend>sign a message</legend>
				<span>message</span>
				<br />
				<textarea
					value={message}
					onChange={(event) => setMessage(event.target.value)}
				/>
				<input
					type="button"
					onClick={() => prove({ secret, hash1, hash2, hash3, msg: message })}
					value="sign"
				/>
			</fieldset>
		</main>
	)
}
