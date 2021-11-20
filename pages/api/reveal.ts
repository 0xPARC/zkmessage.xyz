import * as t from "io-ts"

import { makeHandler } from "next-rest/server"

import { prisma } from "utils/prisma"

const postRequestHeaders = t.type({
	"content-type": t.literal("application/json"),
})

const postRequestBody = t.type({
	userPublicKey: t.string,
	messageId: t.string,
	proof: t.unknown,
	publicSignals: t.array(t.string),
})

type PostRequestHeaders = t.TypeOf<typeof postRequestHeaders>
type PostRequestBody = t.TypeOf<typeof postRequestBody>
type PostResponseHeaders = {}
type PostResponseBody = void

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
		}>
	}
}

export default makeHandler("/api/reveal", {
	POST: {
		headers: postRequestHeaders.is,
		body: postRequestBody.is,
		exec: async ({
			body: { userPublicKey, messageId, proof, publicSignals },
		}) => {
			const { id } = await prisma.reveal.create({
				data: {
					userPublicKey,
					messageId,
					serializedProof: JSON.stringify(proof),
					serializedPublicSignals: JSON.stringify(publicSignals),
				},
				select: { id: true },
			})

			return {
				headers: {},
				body: undefined,
			}
		},
	},
})
