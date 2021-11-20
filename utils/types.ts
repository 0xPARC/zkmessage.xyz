export type Message = {
	id: string
	// createdAt: string
	group: string[]
	msgBody: string
	serializedProof: string
	serializedPublicSignals: string
	msgAttestation: string
	reveal: {
		id: string
		serializedProof: string
		userPublicKey: string
	} | null
	deny: {
		id: string
		serializedProof: string
		userPublicKey: string
	}[]
}

export type User = {
	publicKey: string
	twitterHandle: string
	verificationTweetId: string
	twitterProfileImage: string
}
