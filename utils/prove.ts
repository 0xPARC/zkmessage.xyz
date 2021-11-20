import { Buffer } from "buffer"

import type { VKeys } from "utils/types"

export interface ProofAndVerification {
	publicSignals: string[]
	proof: Object
	verified: boolean
}

const plaintextToHex = (str: string) => {
	const strHex = Buffer.from(str).toString("hex")
	return BigInt("0x" + strHex).toString()
}

const HASH_ARR_SIZE = 40

export async function prove(
	vkeys: VKeys,
	secret: string, // secret is base10 string
	hashes: string[], // list of base10 strings
	msg: string // the message is plain text
): Promise<ProofAndVerification> {
	// const secretHex = hexStrToHex(secret);
	const msgHex = plaintextToHex(msg)
	if (hashes.length < 40) {
		hashes = hashes.concat(Array(HASH_ARR_SIZE - hashes.length).fill("0"))
	} else if (hashes.length > HASH_ARR_SIZE) {
		alert(
			`This app is only configured with max ${HASH_ARR_SIZE} users, truncating array!`
		)
		hashes = hashes.slice(0, HASH_ARR_SIZE)
	}

	console.log("calling snarkjs to construct proof")

	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
		{
			msg: msgHex,
			secret: BigInt("0x" + secret) as any,
			hashes: hashes.map((h) => BigInt("0x" + h)) as any,
		},
		"/sign.wasm",
		"/sign.zkey"
	)

	console.log("got proof", proof)
	console.log("got public signals", publicSignals)

	const verified = await snarkjs.groth16.verify(
		vkeys.sign,
		publicSignals,
		proof
	)

	return { proof, publicSignals, verified }
}

export async function verify(
	vkey: any,
	proof: any,
	publicSignals: any
): Promise<boolean> {
	const res = await snarkjs.groth16.verify(vkey, publicSignals, proof)
	return res
}

export async function revealOrDeny(
	vkeys: VKeys,
	reveal: boolean,
	secret: string,
	hash: string,
	msg: string,
	msgAttestation: string
): Promise<ProofAndVerification> {
	const revealOrDenyStr = reveal ? "reveal" : "deny"
	secret = BigInt("0x" + secret) as any
	hash = BigInt("0x" + hash) as any

	console.log("In reveal")
	console.log(secret)
	console.log(hash)
	console.log(msg)
	console.log(msgAttestation)

	const msgHex = plaintextToHex(msg)

	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
		{ secret: secret, hash: hash, msg: msgHex, msgAttestation: msgAttestation },
		`/${revealOrDenyStr}.wasm`,
		`/${revealOrDenyStr}.zkey`
	)

	console.log(`Got proof for ${revealOrDenyStr}`, proof)

	const vkey = vkeys[revealOrDenyStr]
	const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof)
	console.log(`Got verification result for ${revealOrDenyStr}`, verified)

	return { proof, publicSignals, verified }
}
