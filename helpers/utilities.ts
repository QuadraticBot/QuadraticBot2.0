import {
	CommandInteraction,
	ModalBuilder,
	TimestampStylesString,
	time as timestamp
} from "discord.js"

export const smartTimeout = (callback: Function, time: number) => {
	const MAX_TIME = 2147483647
	let smartTime = 0
	if (time > MAX_TIME) smartTime = MAX_TIME

	setTimeout(() => {
		if (!smartTime) callback()
		else smartTimeout(callback, time - smartTime)
	}, smartTime || time)
}

export const msTimestamp = (time: number, type: TimestampStylesString) =>
	timestamp(Math.floor(time / 1000), type)

export const addModal = async (
	sourceInteraction: CommandInteraction,
	modal: ModalBuilder,
	timeout: number = 120000
) => {
	await sourceInteraction.showModal(modal)
	return await sourceInteraction.awaitModalSubmit({
		time: timeout,
		filter: (filterInteraction) =>
			filterInteraction.customId === `modal-${sourceInteraction.id}`
	})
}

export const randomIndex = (array: Array<any>) =>
	Math.floor(Math.random() * array.length)

export const random = (array: Array<any>) => array[randomIndex(array)]
