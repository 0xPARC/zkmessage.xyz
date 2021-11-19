import React, { useMemo, useState } from "react"
import { mimcHash } from "utils/mimc"

export default function MiMCPage(props: {}) {
	const [value, setValue] = useState("")
	const hash = useMemo(() => {
		const bytes = Buffer.from(value)
		const n = BigInt(bytes.length > 0 ? "0x" + bytes.toString("hex") : 0n)
		return mimcHash(n)
	}, [value])

	return (
		<div className="max-w-lg m-auto font-mono">
			<h1 className="uppercase font-bold pt-16 pb-6">zk chat</h1>
			<div className="border border-gray-300 rounded-xl p-6">
				<input
					type="text"
					value={value}
					onChange={(event) => setValue(event.target.value)}
				/>
				<hr />
				<div className="break-all">
					<p>{hash.toString()}</p>
					<hr />
					<p>0x{hash.toString(16)}</p>
				</div>
			</div>
		</div>
	)
}
