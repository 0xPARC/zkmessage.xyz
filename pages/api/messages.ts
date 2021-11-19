import * as t from "io-ts"

import { makeHandler } from "next-rest/server"

import { prisma } from "utils/prisma"

const postRequestHeaders = t.type({
	"content-type": t.literal("application/json"),
})

const postRequestBody = t.type({
	msgBody: t.string,
	group: t.array(t.string),
	serializedProof: t.string,
	serializedPublicSignals: t.string,
	msgAttestation: t.string,
	proof: t.string,
	publicSignals: t.string,
})

type PostRequestHeaders = t.TypeOf<typeof postRequestHeaders>
type PostRequestBody = t.TypeOf<typeof postRequestBody>
type PostResponseHeaders = { location: string }
type PostResponseBody = void

declare module "next-rest" {
	interface API {
		"/api/messages": Route<{
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

export default makeHandler("/api/messages", {
	POST: {
		headers: postRequestHeaders.is,
		body: postRequestBody.is,
		exec: async ({ body: { group, ...data } }) => {
			const { id } = await prisma.message.create({
				data: {
					...data,
					group: { connect: group.map((id) => ({ publicKey: id })) },
				},
				select: { id: true },
			})

			return {
				headers: { location: `/m/${id}` },
				body: undefined,
			}
		},
	},
})
