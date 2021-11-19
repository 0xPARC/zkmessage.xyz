import { Buffer } from "buffer"

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

	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
		{ msg: msgHex, secret: BigInt("0x" + secret), hashes: hashes },
		"/sign.wasm",
		"/sign.zkey"
	)

	console.log("got proof", proof)
	console.log("got public signals", publicSignals)

	const vkeyPath = "/sign.vkey.json"
	const loadedVKey = await fetch(vkeyPath).then((res) => res.json())
	const verified = await snarkjs.groth16.verify(
		loadedVKey,
		publicSignals,
		proof
	)

	return { proof, publicSignals, verified }
}

// export async function verify(
// 	vkeyPath: any,
// 	{ proof, publicSignals }: Proof
// ): Promise<boolean> {
// 	const loadedVKey = await fetch(vkeyPath).then(res => res.json());
// 	const res = await snarkjs.groth16.verify(loadedVKey, publicSignals, proof);
// 	return res
// }

export async function revealOrDeny(
	reveal: boolean,
	secret: string,
	hash: string,
	msg: string,
	msgAttestation: string
): Promise<ProofAndVerification> {
	const revealOrDenyStr = reveal ? "reveal" : "deny"

	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
		{ secret, hash, msg, msgAttestation },
		`/${revealOrDenyStr}.wasm`,
		`/${revealOrDenyStr}.zkey`
	)

	console.log(`Got proof for ${revealOrDenyStr}`, proof)

	const vkey = await fetch(`/${revealOrDenyStr}.vkey.json`).then((res) =>
		res.json()
	)
	const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof)
	console.log(`Got verification result for ${revealOrDenyStr}`, verified)

	return { proof, publicSignals, verified }
}
