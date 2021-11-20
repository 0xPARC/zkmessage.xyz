import { createContext } from "react"

interface AppContextValue {
	vkeys: {
		sign: any
		reveal: any
		deny: any
	}
}

export const AppContext = createContext<AppContextValue>({
	vkeys: { sign: null, reveal: null, deny: null },
})
