import React from 'react'

const pad = (string) => {('0' + string).slice(-2)}

const format = (seconds) => {
		const date = new Date(seconds * 1000)
		const hh = date.getUTCHours()
		const mm = date.getUTCMinutes()
		const ss = pad(date.getUTCSeconds())
		if (hh) {
				return `${hh}:${pad(mm)}:${ss}`
		}
		return `${mm}:${ss}`
}

export const Duration = ({ className, seconds }) => {
	return (
		<time dateTime={`P${Math.round(seconds)}S`} className={className}>
			{format(seconds)}
		</time>
	)
}
