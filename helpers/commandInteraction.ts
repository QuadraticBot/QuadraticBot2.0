import { CommandInteraction } from "discord.js"
import { QuadraticClient } from "./quadraticClient.js"

export const commandInteraction = async (interaction: CommandInteraction) => {
	const command = (interaction.client as QuadraticClient).commands.get(
		interaction.commandName
	)
	if (!command) return

	try {
		await command.execute(interaction)
	} catch (error) {
		if (error.code == "INTERACTION_COLLECTOR_ERROR")
			return console.info("Modal timed out")

		console.error(error)

		try {
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true
			})
		} catch (error) {
			if (error.code == "INTERACTION_ALREADY_REPLIED")
				console.info("Modal error")
			else console.error(error)
		}
	}
}
