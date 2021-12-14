import { readFileSync } from "fs"

import type { VKeys } from "utils/types"

export function getVKeys(): VKeys {
	const sign = JSON.parse(readFileSync("public/sign.vkey.json", "utf-8"))
	return { sign }
}
