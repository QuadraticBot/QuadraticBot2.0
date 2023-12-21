import {
	SlashCommandBuilder,
	PermissionsBitField,
	ChannelType,
	inlineCode,
	ChatInputCommandInteraction
} from "discord.js"
import { db } from "../../helpers/database.js"

export default {
	data: new SlashCommandBuilder()
		.setName("config")
		.setDescription("Configure this bot.")
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription("What channel can giveaways be created in?")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		)
		.addStringOption((option) =>
			option
				.setName("extra_text")
				.setDescription("Extra text to add to your giveaway messages.")
				.setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName("dm_users")
				.setDescription("DM users when the win a giveaway.")
				.setRequired(true)
		),
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (!interaction.inCachedGuild())
			return await interaction.reply({
				content:
					"An error occurred. Are you attempting to use this command in a DM?"
			})
		if (
			!interaction.member.permissions.has(
				PermissionsBitField.Flags.ManageGuild
			)
		)
			return await interaction.reply({
				content: `You must have the ${inlineCode(
					"Manage Server"
				)} permission to run this command.`,
				ephemeral: true
			})

		const channelOption = interaction.options.getChannel("channel")
		const extraOption = interaction.options.getString("extra_test")
		const dmUsers = interaction.options.getBoolean("dm_users")

		const [guildPrefs] = await db.GuildPrefs.findOrCreate({
			where: { guildId: interaction.guildId },
			defaults: {
				guildId: interaction.guildId
			}
		})

		if (
			!channelOption
				.permissionsFor(interaction.guild.members.me)
				.has([
					PermissionsBitField.Flags.ViewChannel,
					PermissionsBitField.Flags.EmbedLinks,
					PermissionsBitField.Flags.SendMessages,
					PermissionsBitField.Flags.MentionEveryone
				])
		) {
			return await interaction.reply({
				content:
					"I must have the permissions `View Channel`, `Send Messages`, `Embed Links`, and `Mention @everyone, @here, and All Roles` in the text channel. Please fix this, and then try again.",
				ephemeral: true
			})
		}

		await guildPrefs.update({
			giveawayChannelId: channelOption.id,
			extraGiveawayMessage: extraOption,
			DMUsers: dmUsers
		})

		await interaction.reply({ content: `Changes saved!`, ephemeral: true })
	}
}
