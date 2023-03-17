import { time as timestamp } from "discord.js"

export const smartTimeout = (callback, time) => {
	const MAX_TIME = 2147483647
	let smartTime = 0
	if (time > MAX_TIME) smartTime = MAX_TIME

	setTimeout(() => {
		if (!smartTime) callback()
		else smartTimeout(callback, time - smartTime)
	}, smartTime || time)
}

export const msTimestamp = (time, type) =>
	timestamp(Math.floor(time / 1000), type)

export const addModal = async (sourceInteraction, modal, timeout = 120000) => {
	await sourceInteraction.showModal(modal)
	return await sourceInteraction.awaitModalSubmit({
		time: timeout,
		filter: (filterInteraction) =>
			filterInteraction.customId === `modal-${sourceInteraction.id}`
	})
}

export const randomIndex = (array) => Math.floor(Math.random() * array.length)

export const random = (array) => array[randomIndex(array)]
