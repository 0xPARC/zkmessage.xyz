export type Message = {
	id: string
	// createdAt: string
	group: string[]
	msgBody: string
	proof: unknown
	publicSignals: string[]
	msgAttestation: string
	reveal: {
		id: string
		proof: unknown
		userPublicKey: string
		userTwitterProfileImage: string
	} | null
	deny: {
		id: string
		proof: unknown
		userPublicKey: string
		userTwitterProfileImage: string
	}[]
}

export type User = {
	publicKey: string
	twitterHandle: string
	verificationTweetId: string
	twitterProfileImage: string
}

export type VKeys = {
	sign: any
	reveal: any
	deny: any
}
