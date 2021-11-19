import { Buffer } from "buffer"

export interface Proof {
	publicSignals: string[]
	proof: Object
}

const plaintextToHex = (str: string) => {
	const strHex = Buffer.from(str).toString("hex")
	return BigInt("0x" + strHex).toString()
}

const hexStrToHex = (str: string) => {
	return BigInt("0x" + str).toString()
}

const HASH_ARR_SIZE = 40;

export async function prove(
	secret: string, // the secret is just plain text
	hashes: string[], // the list of hashes
	msg: string // the message is plain text
): Promise<Proof> {
	const secretHex = plaintextToHex(secret);
	const msgHex = plaintextToHex(msg)
	if (hashes.length < 40) {
		hashes = hashes.concat(Array(HASH_ARR_SIZE-hashes.length).fill("0"))
	} else if (hashes.length > HASH_ARR_SIZE) {
		alert(`This app is only configured with max ${HASH_ARR_SIZE} users, truncating array!`)
		hashes = hashes.slice(0,HASH_ARR_SIZE);
	}

	const hashesHex = hashes.map((hash) => hexStrToHex(hash));

	console.log(secretHex, msgHex, hashesHex)

	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
		{ msg: msgHex, secret: secretHex, hashes: hashesHex },
		"/hash.wasm",
		"/hash.zkey"
	)

	console.log("got proof", proof)
	console.log("got public signals", publicSignals)
	return { proof, publicSignals }
}

export async function verify(
	vkeyPath: any,
	{ proof, publicSignals }: Proof
): Promise<boolean> {
	const loadedVKey = await fetch(vkeyPath).then(res => res.json());
	const res = await snarkjs.groth16.verify(loadedVKey, publicSignals, proof);
	return res
}


export async function revealOrDeny(
	reveal: boolean,
	secret: string,
	hash: string,
	msg: string,
	msgAttestation: string 
) {
	const revealOrDenyStr = reveal ? 'reveal' : 'deny';

	const {proof, publicSignals} = await snarkjs.groth16.fullProve(
		{secret, hash, msg, msgAttestation},
		`/${revealOrDenyStr}.wasm`,
		`/${revealOrDenyStr}.zkey`
	)

	console.log(`Got proof for ${revealOrDenyStr}`, proof)

	const vkey = await fetch(`/${revealOrDenyStr}.vkey.json`).then((res) => res.json())
	const res = await snarkjs.groth16.verify(vkey, publicSignals, proof)
	console.log(`Got verification result for ${revealOrDenyStr}`, res)

	return res;
}