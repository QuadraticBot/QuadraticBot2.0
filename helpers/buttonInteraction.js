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
			console.error(error)
		}
	}
}
