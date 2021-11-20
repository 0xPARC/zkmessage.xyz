import { createContext } from "react"

import type { VKeys } from "utils/types"

interface AppContextValue {
	vkeys: VKeys
}

export const AppContext = createContext<AppContextValue>({
	vkeys: { sign: null, reveal: null, deny: null },
})
