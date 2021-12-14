import React, { useEffect, useState } from "react"
import type { AppProps } from "next/app"
import Head from "next/head"

import {
	LOCAL_STORAGE_SECRET_KEY,
	LOCAL_STORAGE_SECRET_KEY_UNVERIFIED,
} from "utils/client/localStorage"
import { PageContext } from "utils/context"
import { User } from "utils/types"
import { derivePublicKey } from "utils/mimc"

import "tailwindcss/tailwind.css"
import "../style.css"

export default function App({ Component, pageProps }: AppProps) {
	const [user, setUser] = useState<null | User>(pageProps.user)

	const [loading, setLoading] = useState(true)
	const [secretKey, setSecretKey] = useState<null | string>(null)
	const [unverifiedSecretKey, setUnverifiedSecretKey] = useState<null | string>(
		null
	)

	useEffect(() => {
		const [secretKey, unverifiedSecretKey] = [
			localStorage.getItem(LOCAL_STORAGE_SECRET_KEY),
			localStorage.getItem(LOCAL_STORAGE_SECRET_KEY_UNVERIFIED),
		]

		if (secretKey !== null) {
			setSecretKey(secretKey)
		}

		if (unverifiedSecretKey !== null) {
			setUnverifiedSecretKey(unverifiedSecretKey)
		}

		setLoading(false)
	}, [])

	return (
		<PageContext.Provider
			value={{
				user,
				loading,
				secretKey,
				unverifiedSecretKey,
				setUser,
				setSecretKey,
				setUnverifiedSecretKey,
			}}
		>
			<Head>
				<title>zk message board</title>
				<script src="/snarkjs.min.js" />
			</Head>
			<Component {...pageProps} />
		</PageContext.Provider>
	)
}
