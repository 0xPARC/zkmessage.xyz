export interface PageProps {
	user: User | null
}

export interface User {
	publicKey: string
	twitterHandle: string
	verificationTweetId: string
	twitterProfileImage: string
}

export const userProps = {
	publicKey: true,
	twitterHandle: true,
	verificationTweetId: true,
	twitterProfileImage: true,
}

export interface Thread {
	id: string
	createdAt: string
	updatedAt: string
}

export const threadProps = {
	id: true,
	createdAt: true,
	updatedAt: true,
}

export interface Message {
	id: string
	createdAt: string
	body: string
	hash: string
	proof: {}
	publicSignals: string[]
}

export const messageProps = {
	id: true,
	createdAt: true,
	body: true,
	hash: true,
	proof: true,
	publicSignals: true,
}

export interface VKeys {
	sign: {}
}
