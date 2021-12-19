import { NextApiRequest, NextApiResponse } from "next"
import { hexPattern } from "utils/hexPattern"

import nookies from "nookies"
import { userProps } from "utils/types"
import { prisma } from "utils/server/prisma"

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(400).end()
	}

	const { publicKey } = req.query
	if (typeof publicKey !== "string" || !hexPattern.test(publicKey)) {
		return res.status(400).end()
	}

	const user = await prisma.user.findUnique({
		where: { publicKey },
		select: userProps,
	})

	if (user !== null) {
		nookies.set({ res }, "publicKey", user.publicKey, {
			maxAge: 30 * 24 * 60 * 60,
			path: "/",
			httpOnly: true,
		})
		return res.status(200).json({ user })
	} else {
		return res.status(404).end()
	}
}
