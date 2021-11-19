import { Buffer } from "buffer"

export async function prove(input: {
	secret: string // the secret is just plain text
	hash1: string // the hashes are all hex, no leading 0x
	hash2: string
	hash3: string
	msg: string // the message is plain text
}) {
	const secretHex = Buffer.from(input.secret).toString("hex")
	const secret = secretHex ? BigInt("0x" + secretHex).toString() : "0"
	const hash1 = BigInt("0x" + input.hash1).toString()
	const hash2 = BigInt("0x" + input.hash2).toString()
	const hash3 = BigInt("0x" + input.hash3).toString()
	const messageHex = Buffer.from(input.msg).toString("hex")
	const msg = messageHex ? BigInt("0x" + messageHex).toString() : "0"

	console.log("inputs", { secret, hash1, hash2, hash3, msg })
	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
		{ secret, hash1, hash2, hash3, msg },
		"/hash.wasm",
		"/hash.zkey"
	)

	console.log("got proof", proof)
	console.log("got public signals", publicSignals)

	const vkey = await fetch("/hash.vkey.json").then((res) => res.json())
	const res = await snarkjs.groth16.verify(vkey, publicSignals, proof)
	console.log("got result", res)
	return res
}
