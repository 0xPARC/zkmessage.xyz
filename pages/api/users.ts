import * as t from "io-ts"

import { makeHandler, ServerError } from "next-rest/server"
import { prisma } from "utils/prisma"

const postRequestHeaders = t.type({
	"content-type": t.literal("application/json"),
})

const postRequestBody = t.type({
	publicKey: t.string,
	twitterHandle: t.string,
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
	data: t.array(
		t.type({
			id: t.string,
			text: t.string,
		})
	),
})

export default makeHandler("/api/users", {
	POST: {
		headers: postRequestHeaders.is,
		body: postRequestBody.is,
		exec: async ({ body: { publicKey, twitterHandle } }) => {
			const query = encodeURIComponent(`from:${twitterHandle} "${publicKey}"`)

			const res = await fetch(
				`https://api.twitter.com/2/tweets/search/recent?query=${query}`,
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
			if (!twitterApiResponse.is(data)) {
				throw new ServerError(500, "Unexpected Twitter API response")
			}

			if (data.meta.result_count < 1) {
				throw new ServerError(400, "No tweets matching the public key found")
			}

			const [{ id, text }] = data.data

			// Change this if we wrap the public key with some text or anything
			if (text !== publicKey) {
				throw new ServerError(500, "Invalid tweet syntax")
			}

			await prisma.user.create({
				data: { publicKey, twitterHandle, verificationTweetId: id },
			})

			return { headers: {}, body: undefined }
		},
	},
})
