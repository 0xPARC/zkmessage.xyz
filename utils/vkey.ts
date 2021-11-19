// server side only

import { readFileSync } from "fs"

export function getVKey(): any {
	return JSON.parse(readFileSync("public/hash.vkey.json", "utf-8"))
}
