const {
    SlashCommandBuilder,
    bold,
    time: timestamp,
    channelMention,
    roleMention,
} = require("@discordjs/builders")
const end = require("../../helpers/end.js")
const { v4: uuidv4 } = require("uuid")
const {
    MessageActionRow,
    MessageEmbed,
    MessageButton,
    Permissions,
} = require("discord.js")
const db = require("../../helpers/database.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Starts a giveaway.")
        .addIntegerOption((option) =>
            option
                .setName("winners")
                .setDescription("How many winners should this giveaway have?")
                .setRequired(true)
                .setMinValue(1)
        )
        .addStringOption((option) =>
            option
                .setName("item")
                .setDescription("What are you giving away?")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("minutes")
                .setDescription("Minutes for the giveaway to go on for.")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("hours")
                .setDescription("Hours for the giveaway to go on for.")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("days")
                .setDescription("Days for the giveaway to go on for.")
                .setRequired(true)
        )
        .addRoleOption((option) =>
            option
                .setName("role_requirement_1")
                .setDescription(
                    "What Role is needed to enter this giveaway? (Optional)"
                )
        )
        .addRoleOption((option) =>
            option
                .setName("role_requirement_2")
                .setDescription(
                    "What Role is needed to enter this giveaway? (Optional)"
                )
        )
        .addRoleOption((option) =>
            option
                .setName("role_requirement_3")
                .setDescription(
                    "What Role is needed to enter this giveaway? (Optional)"
                )
        ),

    execute: async (interaction) => {
        const guildPrefs = await db.GuildPrefs.findOne({
            where: { guildId: interaction.guildId },
        })

        if (!guildPrefs || !guildPrefs.giveawayChannelId)
            return await interaction.reply({
                content: "Please use the `/config` command first.",
                ephemeral: true,
            })

        if (
            guildPrefs.giveawayRoleId &&
            !interaction.member.roles.cache.has(guildPrefs.giveawayRoleId)
        )
            return await interaction.reply({
                content: `You need the ${roleMention(
                    guildPrefs.giveawayRoleId
                )} role to use this command.`,
                ephemeral: true,
            })

        const channel = await interaction.client.channels.fetch(
            guildPrefs.giveawayChannelId
        )

        if (
            !channel
                .permissionsFor(interaction.guild.me)
                .has([
                    Permissions.FLAGS.VIEW_CHANNEL,
                    Permissions.FLAGS.EMBED_LINKS,
                    Permissions.FLAGS.SEND_MESSAGES,
                    Permissions.FLAGS.MENTION_EVERYONE,
                ])
        ) {
            return await interaction.editReply({
                content:
                    "I must have the permissions `View Channel`, `Send Messages`, `Embed Links`, and `Mention @everyone, @here, and All Roles` in the text channel. Please fix this, and then try again.",
            })
        }

        const [
            winnersOption,
            itemOption,
            minutesOption,
            hoursOption,
            daysOption,
            requirement1Option,
            requirement2Option,
            requirement3Option,
        ] = interaction.options.data

        const time =
            daysOption.value * 86400000 +
            hoursOption.value * 3600000 +
            minutesOption.value * 60000
        const ends = Date.now() + time

        if (time <= 0)
            return await interaction.editReply("Time must be more than 0.")

        const uuid = uuidv4()

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId(uuid)
                .setLabel(" Enter Giveaway")
                .setStyle("SUCCESS")
                .setEmoji("891803406941974559")
        )

        const embed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle("New giveaway!")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setThumbnail(
                "https://gifimage.net/wp-content/uploads/2017/11/gift-gif-14.gif"
            )
            .setDescription(`Giveaway for ${bold(itemOption.value)}`)
            .addField("Winners", bold(winnersOption.value), true)
            .addField("Ends", timestamp(Math.floor(ends / 1000), "R"), true)
            .addField(
                "Requirements",
                [
                    roleMention(requirement1Option?.role?.id),
                    roleMention(requirement2Option?.role?.id),
                    roleMention(requirement3Option?.role?.id),
                ]
                    .filter(
                        (requirement) =>
                            requirement != "<@&undefined>" &&
                            requirement !=
                                roleMention(interaction.guild.roles.everyone.id)
                    )
                    .join(", ") || "None",
                true
            )
            .setTimestamp()
            .setFooter({
                text: interaction.client.user.tag,
                iconURL: interaction.client.user.displayAvatarURL({
                    dynamic: true,
                }),
            })

        const giveaway = await db.Giveaways.create({
            uuid: uuid,
            guildId: interaction.guildId,
            userId: interaction.user.id,
            item: itemOption.value,
            winners: winnersOption.value,
            endDate: ends,
            requirements:
                [
                    requirement1Option?.role?.id,
                    requirement2Option?.role?.id,
                    requirement3Option?.role?.id,
                ]
                    .filter((requirement) => requirement)
                    .join() || null,
        })

        const message = await channel.send({
            content: guildPrefs.extraGiveawayMessage,
            embeds: [embed],
            components: [row],
        })

        giveaway.update({ messageId: message.id })

        await interaction.reply({
            content: `Created! Check ${channelMention(
                channel.id
            )} to see your new giveaway!`,
            ephemeral: true,
        })

        await end(giveaway, interaction.client)
    },
}
