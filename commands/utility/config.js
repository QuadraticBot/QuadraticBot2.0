import {
    SlashCommandBuilder,
    PermissionsBitField,
    ChannelType,
    inlineCode,
} from "discord.js"
import { db } from "helpers"

export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Configure the bot")
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
    execute: async (interaction) => {
        if (
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.ManageGuild
            )
        )
            return await interaction.reply({
                content: `You must have the ${inlineCode(
                    "Manage Server"
                )} permission to run this command.`,
                ephemeral: true,
            })

        const [channelOption, extraOption, dmUsers] = interaction.options.data

        const [guildPrefs] = await db.GuildPrefs.findOrCreate({
            where: { guildId: interaction.guildId },
            defaults: {
                guildId: interaction.guildId,
            },
        })

        if (
            !channelOption.channel
                .permissionsFor(interaction.guild.members.me)
                .has([
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.EmbedLinks,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.MentionEveryone,
                ])
        ) {
            return await interaction.reply({
                content:
                    "I must have the permissions `View Channel`, `Send Messages`, `Embed Links`, and `Mention @everyone, @here, and All Roles` in the text channel. Please fix this, and then try again.",
                ephemeral: true,
            })
        }

        guildPrefs.update({
            giveawayChannelId: channelOption.channel.id,
            extraGiveawayMessage: extraOption.value,
            DMUsers: dmUsers.value,
        })

        await interaction.reply({ content: `Changes saved!`, ephemeral: true })
    },
}
