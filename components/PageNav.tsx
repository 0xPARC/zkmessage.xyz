import React from "react"

interface PageNavProps {
	currentPage: number
	lastPage: number
}

export const PageNav: React.FC<PageNavProps> = (props) => {
	return (
		<div className="p-2 flex gap-1 text-gray-500">
			<div className="flex-1">
				page {props.currentPage} of {props.lastPage}
			</div>
			<a href={`?page=1`}>first</a>
			<span>·</span>
			<a href={`?page=${Math.max(props.currentPage - 1, 1)}`}>previous</a>
			<span>·</span>
			<a href={`?page=${Math.min(props.currentPage + 1, props.lastPage)}`}>
				next
			</a>
			<span>·</span>
			<a href={`?page=${props.lastPage}`}>last</a>
		</div>
	)
}
