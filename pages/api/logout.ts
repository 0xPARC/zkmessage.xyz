import { NextApiRequest, NextApiResponse } from "next"

import nookies from "nookies"

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(400).end()
	}

	nookies.destroy({ res }, "publicKey", { path: "/", httpOnly: true })

	return res.status(200).end()
}
