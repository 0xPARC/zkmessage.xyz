export function UserIcon({ url }: { url: string }) {
	return (
		<div className="inline-block relative h-6 w-6 bg-gray-200 rounded-full text-center text-gray-400 pt-1 ml-0.5 overflow-hidden border border-gray-200">
			<img className="absolute w-full h-full top-0 left-0" src={url} />
		</div>
	)
}
