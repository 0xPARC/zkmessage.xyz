export default function UserIcon({ address }: { address: string }) {
	return (
		<div className="inline-block h-6 w-6 bg-gray-200 rounded-full text-center text-gray-400 pt-0.5 ml-0.5">
			{address}
		</div>
	)
}
