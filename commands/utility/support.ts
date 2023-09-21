import {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	ChatInputCommandInteraction
} from "discord.js"

export default {
	data: new SlashCommandBuilder()
		.setName("support")
		.setDescription("Report bugs and get help."),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const reportBug = new ButtonBuilder()
			.setURL(
				"https://github.com/Henry-Hiles/QuadraticBot2.0/issues/new?template=bug_report.md"
			)
			.setLabel("Report Bugs")
			.setStyle(ButtonStyle.Link)

		const requestFeature = new ButtonBuilder()
			.setURL(
				"https://github.com/Henry-Hiles/QuadraticBot2.0/issues/new?template=feature_request.md"
			)
			.setLabel("Request a Feature")
			.setStyle(ButtonStyle.Link)

		const joinDiscord = new ButtonBuilder()
			.setURL("https://discord.gg/XmF8GygG5N")
			.setLabel("Join the Discord")
			.setStyle(ButtonStyle.Link)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			reportBug,
			requestFeature,
			joinDiscord
		)

		await interaction.reply({
			content: "Get support here:",
			components: [row],
			ephemeral: true
		})
	}
}
