import * as t from "io-ts"

import { makeHandler, ServerError } from "next-rest/server"
import { prisma } from "utils/prisma"
import { getTextFromPublicKey, zkChatTwitterHandle } from "utils/verification"

const postRequestHeaders = t.type({
	"content-type": t.literal("application/json"),
})

const postRequestBody = t.type({
	publicKey: t.string,
})

type PostRequestHeaders = t.TypeOf<typeof postRequestHeaders>
type PostRequestBody = t.TypeOf<typeof postRequestBody>
type PostResponseHeaders = {}
type PostResponseBody = any

declare module "next-rest" {
	interface API {
		"/api/users": Route<{
			POST: {
				request: {
					headers: PostRequestHeaders
					body: PostRequestBody
				}
				response: {
					headers: PostResponseHeaders
					body: PostResponseBody
				}
			}
		}>
	}
}

const twitterApiResponse = t.type({
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

export default makeHandler("/api/users", {
	POST: {
		headers: postRequestHeaders.is,
		body: postRequestBody.is,
		exec: async ({ body: { publicKey } }) => {
			const query = encodeURIComponent(`@${zkChatTwitterHandle} "${publicKey}"`)
			console.log(query)
			const res = await fetch(
				`https://api.twitter.com/2/tweets/search/recent?query=${query}&expansions=author_id&user.fields=username,profile_image_url`,
				{
					headers: {
						Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
					},
				}
			)

			if (res.status !== 200) {
				throw new ServerError(res.status, res.statusText)
			}

			const data = await res.json()

			console.log(data)

			if (!twitterApiResponse.is(data)) {
				console.error(data)
				throw new ServerError(500, "Unexpected Twitter API response")
			}

			if (data.meta.result_count < 1) {
				throw new ServerError(400, "No tweets matching the public key found")
			}

			const [{ id, author_id, text }] = data.data

			console.log(data.includes.users)

			if (text !== getTextFromPublicKey(publicKey)) {
				throw new ServerError(500, "Invalid tweet syntax")
			}

			const { username, profile_image_url } = data.includes.users.find(
				(user) => user.id === author_id
			)!

			await prisma.user.create({
				data: {
					publicKey,
					twitterId: author_id,
					twitterHandle: username,
					verificationTweetId: id,
					twitterProfileImage: profile_image_url,
				},
			})

			console.log("returning")

			return { headers: {}, body: undefined }
		},
	},
})
