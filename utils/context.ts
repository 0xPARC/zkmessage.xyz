import { createContext } from "react"

import type { User } from "utils/types"

interface PageContext {
	user: null | User
	secretKey: null | string
	unverifiedSecretKey: null | string
	setUser: (user: null | User) => void
	setSecretKey: (secretKey: null | string) => void
	setUnverifiedSecretKey: (unverifiedSecretKey: null | string) => void
	loading: boolean
}

export const PageContext = createContext<PageContext>({
	user: null,
	secretKey: null,
	unverifiedSecretKey: null,
	setUser: (user) => {},
	setSecretKey: (secretKey) => {},
	setUnverifiedSecretKey: (unverifiedSecretKey) => {},
	loading: true,
})
