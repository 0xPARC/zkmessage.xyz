import { NextApiRequest, NextApiResponse } from "next"

import nookies from "nookies"

import * as t from "io-ts"

import { prisma } from "utils/server/prisma"
import { hexPattern } from "utils/hexPattern"
import { userProps } from "utils/types"
import { zkChatTwitterHandle } from "utils/verification"

const twitterSearchResult = t.type({
	meta: t.type({
		newest_id: t.string,
		oldest_id: t.string,
		result_count: t.number,
	}),
	includes: t.type({
		users: t.array(
			t.type({
				id: t.string,
				name: t.string,
				username: t.string,
				profile_image_url: t.string,
			})
		),
	}),
	data: t.array(
		t.type({
			author_id: t.string,
			id: t.string,
			text: t.string,
		})
	),
})

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(400).end()
	}

	const { publicKey } = req.query
	if (typeof publicKey !== "string" || !hexPattern.test(publicKey)) {
		return res.status(400).end()
	}

	const query = encodeURIComponent(`@${zkChatTwitterHandle} "${publicKey}"`)
	const twitterApiResponse = await fetch(
		`https://api.twitter.com/2/tweets/search/recent?query=${query}&expansions=author_id&user.fields=username,profile_image_url`,
		{
			headers: {
				Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
			},
		}
	)

	if (twitterApiResponse.status !== 200) {
		return res.status(500).end()
	}

	const data = await twitterApiResponse.json()
	if (!twitterSearchResult.is(data) || data.meta.result_count < 1) {
		return res.status(500).end()
	}

	const [{ id, author_id }] = data.data

	const { username, profile_image_url } = data.includes.users.find(
		(user) => user.id === author_id
	)!

	await prisma.user
		.create({
			data: {
				publicKey,
				twitterId: author_id,
				twitterHandle: username,
				verificationTweetId: id,
				twitterProfileImage: profile_image_url,
			},
			select: userProps,
		})
		.then((user) => {
			nookies.set({ res }, "publicKey", publicKey, {
				maxAge: 30 * 24 * 60 * 60,
				path: "/",
				httpOnly: true,
			})
			res.status(200).json(user)
		})
		.catch((err) => {
			console.error(err)
			res.status(500).end()
		})
}
