import * as t from "io-ts"

import { makeHandler } from "next-rest/server"

import { prisma } from "utils/prisma"

const postRequestHeaders = t.type({
	"content-type": t.literal("application/json"),
})

const postRequestBody = t.type({
	proof: t.unknown,
	userPublicKey: t.string,
	messageId: t.string,
})

type PostRequestHeaders = t.TypeOf<typeof postRequestHeaders>
type PostRequestBody = t.TypeOf<typeof postRequestBody>
type PostResponseHeaders = {}
type PostResponseBody = void

const getRequestHeaders = t.type({ accept: t.literal("application/json") })
const getRequestBody = t.void

type GetRequestHeaders = t.TypeOf<typeof getRequestHeaders>
type GetRequestBody = t.TypeOf<typeof getRequestBody>
type GetResponseHeaders = { "content-type": "application/json" }
type GetResponseBody = {
	reveals: { userPublicKey: string; messageId: string; proof: unknown }[]
}

declare module "next-rest" {
	interface API {
		"/api/reveal": Route<{
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
			GET: {
				request: {
					headers: GetRequestHeaders
					body: GetRequestBody
				}
				response: {
					headers: GetResponseHeaders
					body: GetResponseBody
				}
			}
		}>
	}
}

export default makeHandler("/api/reveal", {
	POST: {
		headers: postRequestHeaders.is,
		body: postRequestBody.is,
		exec: async ({ body: { userPublicKey, messageId, proof } }) => {
			const { id } = await prisma.reveal.create({
				data: {
					userPublicKey,
					messageId,
					serializedProof: JSON.stringify(proof),
				},
				select: { id: true },
			})

			return {
				headers: {},
				body: undefined,
			}
		},
	},
	GET: {
		headers: getRequestHeaders.is,
		body: getRequestBody.is,
		exec: async ({}) => {
			const reveals = await prisma.reveal.findMany({
				select: { userPublicKey: true, messageId: true, serializedProof: true },
			})

			return {
				headers: { "content-type": "application/json" },
				body: {
					reveals: reveals.map(
						({ userPublicKey, messageId, serializedProof }) => ({
							userPublicKey,
							messageId,
							proof: JSON.parse(serializedProof),
						})
					),
				},
			}
		},
	},
})
