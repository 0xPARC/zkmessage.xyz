import React, { useCallback, useContext, useMemo, useState } from "react"
import { User } from "utils/types"

import AsyncSelect from "react-select/async"
import { useDebouncedCallback } from "use-debounce"
import { ActionMeta, MultiValue, StylesConfig } from "react-select"
import { UserIcon } from "./UserIcon"
import { PageContext } from "utils/context"

type Option = { user: User | null }

const getOptionLabel = (option: Option) =>
	option.user ? (
		<div className="flex items-center gap-x-2">
			<UserIcon user={option.user} />
			<span className="mt-0.5">{option.user.twitterHandle}</span>
		</div>
	) : (
		<div className="flex items-center gap-x-2">Random group</div>
	)

const getOptionValue = (option: Option) =>
	option.user ? option.user.publicKey : ""

interface SelectGroupProps {
	group: User[]
	defaultUsers: User[]
	setGroup: (group: User[]) => void
}

const isUser = (a: User | null, b: User | null) =>
	a !== null && b !== null && a.publicKey === b.publicKey

function toGroup(value: readonly Option[]): User[] {
	const group: User[] = []
	for (const { user } of value) {
		if (user !== null) {
			group.push(user)
		}
	}
	return group
}

function fromGroup(group: User[]): Option[] {
	return group.map((user) => ({ user }))
}

function shuffle<T>(array: T[]) {
	const a = [...array]
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[a[i], a[j]] = [a[j], a[i]]
	}
	return a
}

export const SelectGroup: React.FC<SelectGroupProps> = (props) => {
	const { user } = useContext(PageContext)

	const styles = useMemo<StylesConfig<Option, true>>(
		() => ({
			multiValueRemove: (base, state) =>
				isUser(state.data.user, user) ? { ...base, display: "none" } : base,
			multiValueLabel: (base, state) =>
				isUser(state.data.user, user)
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
		(inputValue: string, callback: (value: Option[]) => void) => {
			setLoading(true)
			fetch(
				`/api/search/users?twitterHandle=${encodeURIComponent(inputValue)}`,
				{ method: "POST" }
			).then(async (res) => {
				if (res.status === 200) {
					const { users }: { users: User[] } = await res.json()
					setLoading(false)
					callback(fromGroup(users))
				} else {
					setLoading(false)
					callback([])
				}
			})
		},
		200
	)

	const isClearable = useMemo(
		() =>
			props.group.some(({ publicKey }) => user && user.publicKey === publicKey),
		[props.group]
	)

	const handleChange = useCallback(
		(value: MultiValue<Option>, actionMeta: ActionMeta<Option>) => {
			if (user === null) {
				return
			} else if (actionMeta.action === "clear") {
				props.setGroup([user])
			} else if (
				actionMeta.action === "pop-value" ||
				actionMeta.action === "remove-value"
			) {
				if (
					actionMeta.removedValue.user !== null &&
					actionMeta.removedValue.user.publicKey !== user.publicKey
				) {
					props.setGroup(toGroup(value))
				}
			} else if (
				actionMeta.action === "select-option" &&
				actionMeta.option !== undefined &&
				actionMeta.option.user === null
			) {
				const group = shuffle(props.defaultUsers)
					.filter(({ publicKey }) => publicKey !== user.publicKey)
					.slice(0, 11)
				props.setGroup([user, ...group])
			} else {
				props.setGroup(toGroup(value))
			}
		},
		[props.setGroup]
	)

	const defaultOptions = useMemo(
		() => fromGroup(props.defaultUsers),
		[props.defaultUsers]
	)

	return (
		<AsyncSelect<Option, true>
			// components={{ MenuList }}
			placeholder=""
			inputId="user-search-input"
			instanceId="user-search-instance"
			isDisabled={user === null}
			isMulti={true}
			styles={styles}
			value={fromGroup(props.group)}
			isClearable={isClearable}
			defaultOptions={
				props.group.length > 1
					? defaultOptions
					: [{ user: null }, ...defaultOptions]
			}
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
