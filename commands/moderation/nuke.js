import {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField,
	ChannelType
} from "discord.js"

export default {
	data: new SlashCommandBuilder()
		.setName("nuke")
		.setDescription("Delete and remake/reposition a channel")
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription("please mention the channel you want to nuke")
				.setRequired(false)
				.addChannelTypes(ChannelType.GuildText)
		),
	async execute(interaction) {
		if (
			!interaction.member.permissions.has(
				PermissionsBitField.Flags.ManageChannels
			)
		) {
			const embed1 = new EmbedBuilder()
				.setTitle("Permission Error")
				.setDescription(
					"You're lacking the permission to run that command"
				)
				.setColor("5865f2")
			return await interaction.reply({
				embeds: [embed1],
				ephemeral: true
			})
		}
		let channel =
			interaction.options.getChannel("channel") || interaction.channel
		let position = channel.position

		try {
			const msg = await channel.clone()
			await channel.delete()
			interaction.guild.channels.setPositions([
				{ channel: msg, position: position + 1 }
			])

			await msg.send({
				embeds: [
					new EmbedBuilder()
						.setTitle("Successfully nuke this channel")
						.setDescription(
							`This Channel has been nuked by <@${interaction.user.id}> (╯°□°)╯︵ ┻━┻`
						)
						.setColor("5865f2")
				]
			})
		} catch (error) {
			console.error(error)
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Something went wrong")
						.setDescription(
							`There was an error while nuking the channel.`
						)
						.setColor("5865f2")
				],
				ephemeral: true
			})
		}
	}
}
