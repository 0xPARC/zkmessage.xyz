export type Message = {
	id: string
	createdAt: number
	group: string[]
	msgBody: string
	proof: unknown
	publicSignals: string[]
	msgAttestation: string
	reveal: {
		id: string
		createdAt: number
		proof: unknown
		publicSignals: string[]
		userPublicKey: string
		userTwitterProfileImage: string
	} | null
	deny: {
		id: string
		createdAt: number
		proof: unknown
		publicSignals: string[]
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
