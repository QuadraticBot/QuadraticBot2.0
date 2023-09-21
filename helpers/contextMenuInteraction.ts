import { ContextMenuCommandInteraction } from "discord.js"
import { QuadraticClient } from "./quadraticClient.js"

export const contextMenuInteraction = async (
	interaction: ContextMenuCommandInteraction
) => {
	const command = (interaction.client as QuadraticClient).contextMenus.get(
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
				console.warn("Modal error")
		}
	}
}
