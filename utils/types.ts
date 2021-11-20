export type Message = {
	id: string
	// createdAt: string
	group: string[]
	msgBody: string
	proof: string
	publicSignals: string
	msgAttestation: string
	reveal: {
		id: string
		proof: unknown
		userPublicKey: string
	} | null
	deny: {
		id: string
		proof: unknown
		userPublicKey: string
	}[]
}

export type User = {
	publicKey: string
	twitterHandle: string
	verificationTweetId: string
	twitterProfileImage: string
}
