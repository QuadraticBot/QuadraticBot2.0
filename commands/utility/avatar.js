import {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} from "discord.js"

export default {
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("No description")
		.addUserOption((option) =>
			option.setName("user").setDescription("Please mention the user")
		),
	execute: async (interaction) => {
		const user = interaction.options.getUser("user") ?? interaction.user
		const animated = user.avatar.startsWith("a_")

		const embed = new EmbedBuilder()
			.setColor("#14bbaa")
			.setDescription(`${user}'s avatar:`)
			.setImage(user.displayAvatarURL())
		const row = new ActionRowBuilder().addComponents([
			new ButtonBuilder()
				.setURL(user.displayAvatarURL())
				.setLabel(animated ? "GIF" : "WEBP")
				.setStyle(ButtonStyle.Link)
		])

		if (!animated)
			row.addComponents(
				new ButtonBuilder()
					.setURL(
						user.displayAvatarURL({
							extension: "png"
						})
					)
					.setLabel("PNG")
					.setStyle(ButtonStyle.Link),
				new ButtonBuilder()
					.setURL(
						user.displayAvatarURL({
							extension: "jpg"
						})
					)
					.setLabel("JPG")
					.setStyle(ButtonStyle.Link)
			)

		await interaction.reply({
			embeds: [embed],
			components: [row],
			ephemeral: true
		})
	}
}
