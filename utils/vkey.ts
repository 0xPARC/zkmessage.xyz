// server side only

import { readFileSync } from "fs"

export function getVKeys(): { sign: any; reveal: any; deny: any } {
	const sign = JSON.parse(readFileSync("public/sign.vkey.json", "utf-8"))
	const reveal = JSON.parse(readFileSync("public/reveal.vkey.json", "utf-8"))
	const deny = JSON.parse(readFileSync("public/deny.vkey.json", "utf-8"))
	return { sign, reveal, deny }
}
