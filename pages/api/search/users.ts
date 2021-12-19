import { NextApiRequest, NextApiResponse } from "next"

import { prisma } from "utils/server/prisma"
import { userProps } from "utils/types"

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(400).end()
	}

	const { twitterHandle } = req.query
	if (typeof twitterHandle !== "string") {
		return res.status(400).end()
	}

	const users = await prisma.user.findMany({
		where: { twitterHandle: { contains: decodeURIComponent(twitterHandle) } },
		select: userProps,
		take: 10,
	})

	res.status(200).json({ users })
}
