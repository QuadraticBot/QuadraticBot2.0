import {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	PermissionsBitField,
	ButtonStyle,
	CommandInteraction,
	OAuth2Scopes,
	ChatInputCommandInteraction
} from "discord.js"

export default {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Invite this bot to your server."),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const button = new ButtonBuilder()
			.setURL(
				interaction.client.generateInvite({
					permissions: [
						PermissionsBitField.Flags.ViewChannel,
						PermissionsBitField.Flags.EmbedLinks,
						PermissionsBitField.Flags.SendMessages,
						PermissionsBitField.Flags.MentionEveryone
					],
					scopes: [OAuth2Scopes.Bot]
				})
			)
			.setLabel("Invite Me")
			.setStyle(ButtonStyle.Link)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
		await interaction.reply({
			content: "Click the button below to invite me to your server.",
			components: [row],
			ephemeral: true
		})
	}
}
