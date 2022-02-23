const { SlashCommandBuilder, inlineCode } = require("@discordjs/builders")
const { ChannelType } = require("discord-api-types/v9")
const { Permissions } = require("discord.js")
const db = require("../../helpers/database.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Configure the bot")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("What channel can giveaways be created in?")
                .setRequired(true)
                .addChannelType(ChannelType.GuildText)
        )
        .addStringOption((option) =>
            option
                .setName("extra_text")
                .setDescription("Extra text to add to your giveaway messages.")
                .setRequired(true)
        )
        .addRoleOption((option) =>
            option
                .setName("giveaway_role")
                .setDescription(
                    "Role needed to make giveaways. Set to @everyone for no role."
                )
                .setRequired(true)
        ),
    execute: async (interaction) => {
        if (
            !interaction.member.permissions.has(
                Permissions.FLAGS.MANAGE_GUILD
            )
        )
            return await interaction.reply({
                content: `You must have the ${inlineCode(
                    "Manage Server"
                )} permission to run this command.`,
                ephemeral: true,
            })

        const [channelOption, extraOption, roleOption] =
            interaction.options.data

        const [guildPrefs] = await db.GuildPrefs.findOrCreate({
            where: { guildId: interaction.guildId },
            defaults: {
                guildId: interaction.guildId,
            },
        })

        if (roleOption) {
            if (roleOption?.role?.id == interaction.guild.roles.everyone.id)
                guildPrefs.update({ giveawayRoleId: null })
            else guildPrefs.update({ giveawayRoleId: roleOption?.role?.id })

            console.log(
                `${roleOption?.role?.name} (${roleOption?.role?.id}) is the new giveaway making role in ${interaction.guild}.`
            )
        }

        if (
            !channelOption.channel
                .permissionsFor(interaction.guild.me)
                .has([
                    Permissions.FLAGS.VIEW_CHANNEL,
                    Permissions.FLAGS.EMBED_LINKS,
                    Permissions.FLAGS.SEND_MESSAGES,
                    Permissions.FLAGS.MENTION_EVERYONE,
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
        })

        await interaction.reply(`Changes saved!`)
    },
}
