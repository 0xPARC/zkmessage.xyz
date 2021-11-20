import { string } from "fp-ts"
import * as t from "io-ts"

import { makeHandler } from "next-rest/server"

import { prisma } from "utils/prisma"

const postRequestHeaders = t.type({
	"content-type": t.literal("application/json"),
})

const postRequestBody = t.type({
	msgBody: t.string,
	group: t.array(t.string),
	proof: t.unknown,
	publicSignals: t.array(t.string),
	msgAttestation: t.string,
})

type PostRequestHeaders = t.TypeOf<typeof postRequestHeaders>
type PostRequestBody = t.TypeOf<typeof postRequestBody>
type PostResponseHeaders = { location: string }
type PostResponseBody = void

const getRequestHeaders = t.type({ accept: t.literal("application/json") })
const getRequestBody = t.void

type GetRequestHeaders = t.TypeOf<typeof getRequestHeaders>
type GetRequestBody = t.TypeOf<typeof getRequestBody>
type GetResponseHeaders = { "content-type": "application/json" }
type GetResponseBody = {
	messages: {
		group: string[]
		msgBody: string
		proof: unknown
		publicSignals: string[]
		msgAttestation: string
	}[]
}

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

export default makeHandler("/api/messages", {
	POST: {
		headers: postRequestHeaders.is,
		body: postRequestBody.is,
		exec: async ({
			body: { group, msgBody, proof, publicSignals, msgAttestation },
		}) => {
			const { id } = await prisma.message.create({
				data: {
					group: { connect: group.map((id) => ({ publicKey: id })) },
					msgBody,
					serializedProof: JSON.stringify(proof),
					serializedPublicSignals: JSON.stringify(publicSignals),
					msgAttestation,
				},
				select: { id: true },
			})

			return {
				headers: { location: `/m/${id}` },
				body: undefined,
			}
		},
	},
	GET: {
		headers: getRequestHeaders.is,
		body: getRequestBody.is,
		exec: async ({}) => {
			const messages = await prisma.message.findMany({
				select: {
					group: { select: { publicKey: true } },
					msgBody: true,
					serializedProof: true,
					serializedPublicSignals: true,
					msgAttestation: true,
				},
			})

			return {
				headers: { "content-type": "application/json" },
				body: {
					// We want to reverse the array to get the most-recently added to show up first.
					messages: messages.reverse().map(
						({
							group,
							msgBody,
							serializedProof,
							serializedPublicSignals,
							msgAttestation,
						}) => ({
							group: group.map((user) => user.publicKey),
							msgBody,
							proof: JSON.parse(serializedProof),
							publicSignals: JSON.parse(serializedPublicSignals),
							msgAttestation,
						})
					),
				},
			}
		},
	},
})
