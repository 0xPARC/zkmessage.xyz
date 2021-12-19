import React, { useCallback, useContext, useMemo, useState } from "react"
import { User } from "utils/types"

import AsyncSelect from "react-select/async"
import { useDebouncedCallback } from "use-debounce"
import { ActionMeta, MultiValue, StylesConfig } from "react-select"
import { UserIcon } from "./UserIcon"
import { PageContext } from "utils/context"

const getOptionLabel = (user: User) => (
	<div className="flex items-center gap-x-2">
		<UserIcon user={user} />
		<span className="mt-0.5">{user.twitterHandle}</span>
	</div>
)

const getOptionValue = (user: User) => user.publicKey

interface SelectGroupProps {
	group: User[]
	defaultUsers: User[]
	setGroup: (group: User[]) => void
}

export const SelectGroup: React.FC<SelectGroupProps> = (props) => {
	const { user } = useContext(PageContext)

	const styles = useMemo<StylesConfig<User, true>>(
		() => ({
			multiValueRemove: (base, state) =>
				state.data.publicKey === user?.publicKey
					? { ...base, display: "none" }
					: base,
			multiValueLabel: (base, state) =>
				state.data.publicKey === user?.publicKey
					? { ...base, paddingRight: 8 }
					: { ...base },
			multiValue: (base, state) => ({ ...base, borderRadius: "0.25rem" }),
			control: (base, state) => ({
				...base,
				borderRadius: "0.5rem",
				borderWidth: 2,
				border: "none",
			}),
			valueContainer: (base, state) => ({ ...base, padding: 4 }),
		}),
		[]
	)

	const [searchValue, setSearchValue] = useState("")
	const [loading, setLoading] = useState(false)

	const loadOptions = useDebouncedCallback(
		(inputValue: string, callback: (group: User[]) => void) => {
			setLoading(true)
			fetch(
				`/api/search/users?twitterHandle=${encodeURIComponent(inputValue)}`,
				{ method: "POST" }
			).then(async (res) => {
				if (res.status === 200) {
					const { users } = await res.json()
					setLoading(false)
					callback(users)
				} else {
					setLoading(false)
					callback([])
				}
			})
		},
		200
	)

	const isClearable = useMemo(
		() => props.group.some((user) => user.publicKey !== user?.publicKey),
		[props.group]
	)

	const handleChange = useCallback(
		(value: MultiValue<User>, actionMeta: ActionMeta<User>) => {
			if (actionMeta.action === "clear") {
				props.setGroup(user ? [user] : [])
			} else if (
				actionMeta.action === "pop-value" ||
				actionMeta.action === "remove-value"
			) {
				if (actionMeta.removedValue.publicKey !== user?.publicKey) {
					props.setGroup(value as User[])
				}
			} else {
				props.setGroup(value as User[])
			}
		},
		[props.setGroup]
	)

	return (
		<AsyncSelect<User, true>
			placeholder=""
			inputId="user-search-input"
			instanceId="user-search-instance"
			isDisabled={user === null}
			isMulti={true}
			styles={styles}
			value={props.group}
			isClearable={isClearable}
			defaultOptions={props.defaultUsers}
			inputValue={searchValue}
			onInputChange={setSearchValue}
			loadOptions={loadOptions}
			isLoading={loading}
			onChange={handleChange}
			// @ts-ignore
			getOptionLabel={getOptionLabel}
			getOptionValue={getOptionValue}
		/>
	)
}
