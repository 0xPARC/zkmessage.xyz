import React from "react"
import type { AppProps } from "next/app"
import Head from "next/head"

import "tailwindcss/tailwind.css"
import "../style.css"

export default function App(props: AppProps) {
	const { Component, pageProps } = props
	return (
		<>
			<Head>
				<title>zk message board</title>
				<script src="/snarkjs.min.js" />
			</Head>
			<Component {...pageProps} />
		</>
	)
}
