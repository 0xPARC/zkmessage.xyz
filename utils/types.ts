export interface Message {
	id: string
	message: string
	messageAttestation: string
	proof: string
	group: string[]
	reveals: string[]
	denials: string[]
}

export interface User {
	handle: string
	hash: string
}
