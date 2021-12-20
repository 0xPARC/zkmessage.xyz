import { NextApiRequest, NextApiResponse } from "next"
import { hexPattern } from "utils/hexPattern"

import * as t from "io-ts"

import { prisma } from "utils/server/prisma"

const twitterAvatarResult = t.type({
	data: t.type({
		profile_image_url: t.string
	})
})

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { publicKey } = req.query
	if (typeof publicKey !== "string" || !hexPattern.test(publicKey)) {
		return res.status(400).end()
	}

	const user = await prisma.user.findUnique({
		where: { publicKey },
		select: {
			twitterId: true
		}
	})

	if(!user) return res.status(404).end()

	const { twitterId } = user

	const twitterApiResponse = await fetch(
		`https://api.twitter.com/2/users/${twitterId}?user.fields=profile_image_url`,
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
	if (!twitterAvatarResult.is(data) || !data.data.profile_image_url) {
		return res.status(500).end()
	}

	const profileImageUrl = data.data.profile_image_url
	res.status(200).json({
		profileImage: profileImageUrl
	})

	await prisma.user.update({
		where: {
			publicKey,
		},
		data: {
			twitterProfileImage: profileImageUrl
		}
	})
}
