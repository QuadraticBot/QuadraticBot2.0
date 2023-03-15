import { Op } from "sequelize"
import { bold } from "discord.js"
import { db } from "./database.js"
import { EmbedBuilder } from "discord.js"
import { v4 as uuidv4 } from "uuid"

export const buttonInteraction = async (interaction) => {
	const button = interaction.client.buttons.get(interaction.customId)
	if (!button) return

	try {
		await button.execute(interaction)
	} catch (error) {
		console.error(error)

		try {
			await interaction.reply({
				content: "There was an error while executing this button!",
				ephemeral: true
			})
		} catch (error) {
			if (error.code == "INTERACTION_ALREADY_REPLIED")
				console.info("Modal error")
			else console.error(error)
		}
	}
}
