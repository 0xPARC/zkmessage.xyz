import * as t from "io-ts"

import { makeHandler } from "next-rest/server"
import { prisma } from "utils/prisma"

const postRequestHeaders = t.type({ accept: t.literal("application/json") })
const postRequestBody = t.type({
	publicKey: t.string,
	twitterHandle: t.string,
})

type PostRequestHeaders = t.TypeOf<typeof postRequestHeaders>
type PostRequestBody = t.TypeOf<typeof postRequestBody>
type PostResponseHeaders = {}
type PostResponseBody = void

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

export default makeHandler("/api/users", {
	POST: {
		headers: postRequestHeaders.is,
		body: postRequestBody.is,
		exec: async ({ body }) => {
			await prisma.user.create({ data: body })
			return { headers: {}, body: undefined }
		},
	},
})
