const {
    SlashCommandBuilder,
    bold,
    time: timestamp,
    channelMention,
    roleMention,
} = require("@discordjs/builders")
const end = require("../../helpers/end.js")
const { v4: uuidv4 } = require("uuid")
const addModal = require("../../helpers/addModal")
const {
    MessageActionRow,
    MessageEmbed,
    MessageButton,
    Permissions,
    TextInputComponent,
    Modal,
} = require("discord.js")
const db = require("../../helpers/database.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Starts a giveaway.")
        .addRoleOption((option) =>
            option
                .setName("role_requirement_1")
                .setDescription(
                    "What role is needed to enter this giveaway? (Optional)"
                )
        )
        .addRoleOption((option) =>
            option
                .setName("role_requirement_2")
                .setDescription(
                    "What role is needed to enter this giveaway? (Optional)"
                )
        )
        .addRoleOption((option) =>
            option
                .setName("role_requirement_3")
                .setDescription(
                    "What role is needed to enter this giveaway? (Optional)"
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
            !interaction.member.roles.cache.has(guildPrefs.giveawayRoleId) &&
            !interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
        )
            return await interaction.reply({
                content: `You need the ${roleMention(
                    guildPrefs.giveawayRoleId
                )} role to use this command.`,
                ephemeral: true,
            })

        let channel

        try {
            channel = await interaction.client.channels.fetch(
                guildPrefs.giveawayChannelId
            )
        } catch (error) {
            if (error.code == 10003)
                return interaction.reply("Please run `/config` again.")
            throw error
        }

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
            return await interaction.reply({
                content:
                    "I must have the permissions `View Channel`, `Send Messages`, `Embed Links`, and `Mention @everyone, @here, and All Roles` in the text channel. Please fix this, and then try again.",
                ephemeral: true,
            })
        }

        const rows = [
            new MessageActionRow().addComponents(
                new TextInputComponent()
                    .setCustomId("winners")
                    .setLabel("Winners")
                    .setPlaceholder("How many winners should this have?")
                    .setRequired(true)
                    .setStyle("SHORT")
            ),
            new MessageActionRow().addComponents(
                new TextInputComponent()
                    .setCustomId("item")
                    .setLabel("Item")
                    .setPlaceholder("What are you giving away?")
                    .setRequired(true)
                    .setStyle("PARAGRAPH")
            ),
            new MessageActionRow().addComponents(
                new TextInputComponent()
                    .setCustomId("minutes")
                    .setLabel("Minutes")
                    .setPlaceholder("How many minutes should this last?")
                    .setStyle("SHORT")
            ),
            new MessageActionRow().addComponents(
                new TextInputComponent()
                    .setCustomId("hours")
                    .setLabel("Hours")
                    .setPlaceholder("How many hours should this last?")
                    .setStyle("SHORT")
            ),
            new MessageActionRow().addComponents(
                new TextInputComponent()
                    .setCustomId("days")
                    .setLabel("Days")
                    .setPlaceholder("How many days should this last?")
                    .setStyle("SHORT")
            ),
        ]

        const modal = new Modal()
            .setCustomId(`modal-${interaction.id}`)
            .addComponents(rows)
            .setTitle("Giveaway")

        const modalSubmitInteraction = await addModal(interaction, modal)

        const winnersOption =
                modalSubmitInteraction.fields.getTextInputValue("winners"),
            itemOption =
                modalSubmitInteraction.fields.getTextInputValue("item"),
            minutesOption =
                modalSubmitInteraction.fields.getTextInputValue("minutes") || 0,
            hoursOption =
                modalSubmitInteraction.fields.getTextInputValue("hours") || 0,
            daysOption =
                modalSubmitInteraction.fields.getTextInputValue("days") || 0

        const [requirement1Option, requirement2Option, requirement3Option] =
            interaction.options.data

        const time =
            daysOption * 86400000 +
            hoursOption * 3600000 +
            minutesOption * 60000

        const ends = Date.now() + time

        if (!time || time <= 0)
            return await modalSubmitInteraction.reply({
                content: "Time must be a whole number greater than 0.",
                ephemeral: true,
            })

        if (!Number(winnersOption) || Number(winnersOption) < 1)
            return await modalSubmitInteraction.reply({
                content: "Winnners must be a number greater than 0.",
                ephemeral: true,
            })

        const uuid = uuidv4()

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId(uuid)
                .setLabel(" Enter Giveaway")
                .setStyle("SUCCESS")
                .setEmoji("891803406941974559")
        )

        const embed = new MessageEmbed()
            .setColor("#14bbaa")
            .setTitle("New giveaway!")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setThumbnail(
                "https://gifimage.net/wp-content/uploads/2017/11/gift-gif-14.gif"
            )
            .setDescription(`Giveaway for ${bold(itemOption)}`)
            .addField("Winners", bold(winnersOption), true)
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
            item: itemOption,
            winners: winnersOption,
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

        await modalSubmitInteraction.reply({
            content: `Created! Check ${channelMention(
                channel.id
            )} to see your new giveaway!`,
            ephemeral: true,
        })

        await end(giveaway, interaction.client)
    },
}
