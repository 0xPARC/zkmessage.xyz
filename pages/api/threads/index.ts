import * as t from "io-ts"

import { NextApiRequest, NextApiResponse } from "next"
import { hashMessage } from "utils/mimc"

import { prisma } from "utils/server/prisma"

const postRequestBody = t.type({
	group: t.array(t.string),
	firstMessage: t.type({
		body: t.string,
		hash: t.string,
		proof: t.type({}),
		publicSignals: t.array(t.string),
	}),
})

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(400).end()
	}

	if (!postRequestBody.is(req.body)) {
		return res.status(400).end()
	}

	const { group, firstMessage } = req.body

	if (hashMessage(firstMessage.body).toString(16) !== firstMessage.hash) {
		return res.status(400).end()
	}

	const { id } = await prisma.thread.create({
		data: { group: { connect: group.map((id) => ({ publicKey: id })) } },
		select: { id: true },
	})

	await prisma.message
		.create({
			data: {
				...firstMessage,
				thread: { connect: { id } },
				isFirstMessageOf: { connect: { id } },
				isLastMessageOf: { connect: { id } },
			},
		})
		.then(() => {
			res.setHeader("Location", `/thread/${id}`)
			res.status(200).end()
		})
		.catch((err) => {
			console.error(err)
			res.status(500).end()
		})
}
