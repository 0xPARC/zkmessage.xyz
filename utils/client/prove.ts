import { hashMessage } from "utils/mimc"

import type { Message, User, VKeys } from "utils/types"

export interface ProofAndVerification {
	publicSignals: string[]
	proof: Object
	verified: boolean
}

const hexToDec = (hex: string) => BigInt("0x" + hex).toString(10)

const HASH_ARR_SIZE = 40
const MESSAGE_PUBLIC_SIGNALS_INDEX = 41

export async function sign(
	secretKey: string,
	group: User[],
	body: string
): Promise<{ proof: {}; publicSignals: string[] }> {
	if (group.length > HASH_ARR_SIZE) {
		throw new Error("too many users in group")
	}

	const msg = hashMessage(body).toString(10)
	const hashes = group
		.map((user) => hexToDec(user.publicKey))
		.concat(Array(HASH_ARR_SIZE - group.length).fill("0"))

	const input = { msg, secret: hexToDec(secretKey), hashes }

	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
		input,
		"/sign.wasm",
		"/sign.zkey"
	)

	return { proof, publicSignals }
}

export async function verifyMessage(
	vKeys: VKeys,
	message: Message
): Promise<boolean> {
	console.log("verifying message", message)
	console.log("verifying message hash...")
	const hash = hashMessage(message.body)
	if (
		hash.toString(16) !== message.hash ||
		hash.toString(10) !== message.publicSignals[MESSAGE_PUBLIC_SIGNALS_INDEX]
	) {
		console.error("bad message hash!")
		return false
	}

	console.log("message hashes match!")
	console.log("verifying message proof...")
	const verified = await snarkjs.groth16.verify(
		vKeys.sign,
		message.publicSignals,
		message.proof
	)
	if (verified) {
		console.log("message proof is valid!")
	} else {
		console.error("invalid message proof!")
	}
	return verified
}

// export async function prove(
// 	vkeys: VKeys,
// 	secret: string, // secret is base10 string
// 	hashes: string[], // list of base10 strings
// 	msg: string // the message is plain text
// ): Promise<ProofAndVerification> {
// 	// const secretHex = hexStrToHex(secret);
// 	const msgHex = plaintextToHex(msg)
// 	if (hashes.length < 40) {
// 		hashes = hashes.concat(Array(HASH_ARR_SIZE - hashes.length).fill("0"))
// 	} else if (hashes.length > HASH_ARR_SIZE) {
// 		alert(
// 			`This app is only configured with max ${HASH_ARR_SIZE} users, truncating array!`
// 		)
// 		hashes = hashes.slice(0, HASH_ARR_SIZE)
// 	}

// 	console.log("calling snarkjs to construct proof")

// 	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
// 		{
// 			msg: msgHex,
// 			secret: BigInt("0x" + secret) as any,
// 			hashes: hashes.map((h) => BigInt("0x" + h)) as any,
// 		},
// 		"/sign.wasm",
// 		"/sign.zkey"
// 	)

// 	console.log("got proof", proof)
// 	console.log("got public signals", publicSignals)

// 	const verified = await snarkjs.groth16.verify(
// 		vkeys.sign,
// 		publicSignals,
// 		proof
// 	)

// 	return { proof, publicSignals, verified }
// }

// export async function revealOrDeny(
// 	vkeys: VKeys,
// 	reveal: boolean,
// 	secret: string,
// 	hash: string,
// 	msg: string,
// 	msgAttestation: string
// ): Promise<ProofAndVerification> {
// 	const revealOrDenyStr = reveal ? "reveal" : "deny"
// 	secret = BigInt("0x" + secret) as any
// 	hash = BigInt("0x" + hash) as any

// 	console.log("In reveal")
// 	console.log(secret)
// 	console.log(hash)
// 	console.log(msg)
// 	console.log(msgAttestation)

// 	const msgHex = plaintextToHex(msg)

// 	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
// 		{ secret: secret, hash: hash, msg: msgHex, msgAttestation: msgAttestation },
// 		`/${revealOrDenyStr}.wasm`,
// 		`/${revealOrDenyStr}.zkey`
// 	)

// 	console.log(`Got proof for ${revealOrDenyStr}`, proof)

// 	const vkey = vkeys[revealOrDenyStr]
// 	const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof)
// 	console.log(`Got verification result for ${revealOrDenyStr}`, verified)

// 	return { proof, publicSignals, verified }
// }
