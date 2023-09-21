import {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField,
	ChannelType,
	Interaction,
	CommandInteraction,
	ChatInputCommandInteraction,
	TextChannel,
	VoiceChannel,
	ForumChannel,
	ThreadChannel
} from "discord.js"

export default {
	data: new SlashCommandBuilder()
		.setName("nuke")
		.setDescription("Delete and remake/reposition a channel")
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription("What channel do you want to nuke?")
				.setRequired(false)
				.addChannelTypes(ChannelType.GuildText)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild())
			return await interaction.reply({
				content:
					"An error occurred. Are you attempting to use this command in a DM?"
			})

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
				.setColor("#5865f2")
			return await interaction.reply({
				embeds: [embed1],
				ephemeral: true
			})
		}
		let channel =
			interaction.options.getChannel("channel") || interaction.channel
		if (!("position" in channel))
			return await interaction.reply({
				content: "This channel type can not be nuked.",
				ephemeral: true
			})
		let position = channel.position

		try {
			const newChannel = await channel.clone()
			await channel.delete()
			interaction.guild.channels.setPositions([
				{ channel: newChannel, position: position + 1 }
			])

			if ("send" in newChannel)
				await newChannel.send({
					embeds: [
						new EmbedBuilder()
							.setTitle("Successfully nuked this channel")
							.setDescription(
								`This Channel has been nuked by <@${interaction.user.id}> (╯°□°)╯︵ ┻━┻`
							)
							.setColor("#5865f2")
					]
				})
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Success")
						.setDescription(
							`Channel nuked successfully. (╯°□°)╯︵ ┻━┻`
						)
						.setColor("#5865f2")
				],
				ephemeral: true
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
						.setColor("#5865f2")
				],
				ephemeral: true
			})
		}
	}
}
