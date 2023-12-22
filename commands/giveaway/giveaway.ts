import {
    SlashCommandBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    TextInputBuilder,
    ModalBuilder,
    bold,
    channelMention,
    roleMention,
    PermissionsBitField,
    TextInputStyle,
    TextChannel,
    ChatInputCommandInteraction,
} from "discord.js"
import { v4 as uuidv4 } from "uuid"
import { db } from "../../helpers/database.js"
import { end } from "../../helpers/end.js"
import { addModal, msTimestamp } from "../../helpers/utilities.js"
import { QuadraticClient } from "../../models/quadraticClient.js"
import enterButton from "../../components/enterButton.js"

export default {
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

    execute: async (interaction: ChatInputCommandInteraction) => {
        const guildPrefs = await db.GuildPrefs.findOne({
            where: { guildId: interaction.guildId },
        })

        if (!guildPrefs || !guildPrefs.giveawayChannelId)
            return await interaction.reply({
                content: "Please use the `/config` command first.",
                ephemeral: true,
            })

        let textChannel: TextChannel

        try {
            const channel = await interaction.client.channels.fetch(
                guildPrefs.giveawayChannelId
            )
            if (channel instanceof TextChannel) textChannel = channel
        } catch (error) {
            if (error.code == 10003)
                return await interaction.reply("Please run `/config` again.")
            throw error
        }

        if (!textChannel)
            return await interaction.reply("Please run `/config` again.")

        if (
            !textChannel
                .permissionsFor(interaction.guild.members.me)
                .has([
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

        const buildTextInputRow = (textInputBuilder: TextInputBuilder) =>
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                textInputBuilder
            )

        const modal = new ModalBuilder()
            .setCustomId(`modal-${interaction.id}`)
            .addComponents([
                buildTextInputRow(
                    new TextInputBuilder()
                        .setCustomId("winners")
                        .setLabel("Winners")
                        .setPlaceholder("How many winners should this have?")
                        .setStyle(TextInputStyle.Short)
                ),
                buildTextInputRow(
                    new TextInputBuilder()
                        .setCustomId("item")
                        .setLabel("Item")
                        .setPlaceholder("What are you giving away?")
                        .setStyle(TextInputStyle.Paragraph)
                ),
                buildTextInputRow(
                    new TextInputBuilder()
                        .setCustomId("minutes")
                        .setLabel("Minutes")
                        .setPlaceholder("How many minutes should this last?")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                ),
                buildTextInputRow(
                    new TextInputBuilder()
                        .setCustomId("hours")
                        .setLabel("Hours")
                        .setPlaceholder("How many hours should this last?")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                ),
                buildTextInputRow(
                    new TextInputBuilder()
                        .setCustomId("days")
                        .setLabel("Days")
                        .setPlaceholder("How many days should this last?")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                ),
            ])
            .setTitle("Giveaway")

        const modalSubmitInteraction = await addModal(interaction, modal)

        const itemOption =
            modalSubmitInteraction.fields.getTextInputValue("item")
        const winnersOption = Number(
            modalSubmitInteraction.fields.getTextInputValue("winners")
        )
        const minutesOption = Number(
            modalSubmitInteraction.fields.getTextInputValue("minutes") || 0
        )
        const hoursOption = Number(
            modalSubmitInteraction.fields.getTextInputValue("hours") || 0
        )
        const daysOption = Number(
            modalSubmitInteraction.fields.getTextInputValue("days") || 0
        )

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
                content: "Winners must be a number greater than 0.",
                ephemeral: true,
            })

        const uuid = uuidv4()

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            enterButton
        )

        const embed = new EmbedBuilder()
            .setColor("#14bbaa")
            .setTitle("New giveaway!")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`Giveaway for ${bold(itemOption)}`)
            .addFields(
                {
                    name: "Winners",
                    value: bold(winnersOption.toString()),
                    inline: true,
                },
                {
                    name: "Ends",
                    value: msTimestamp(ends, "R"),
                    inline: true,
                },
                {
                    name: "Requirements",
                    value:
                        [
                            roleMention(requirement1Option?.role?.id),
                            roleMention(requirement2Option?.role?.id),
                            roleMention(requirement3Option?.role?.id),
                        ]
                            .filter(
                                (requirement) =>
                                    requirement != "<@&undefined>" &&
                                    requirement !=
                                        roleMention(
                                            interaction.guild.roles.everyone.id
                                        )
                            )
                            .join(", ") || "None",
                    inline: true,
                },
                {
                    name: "Entrants",
                    value: bold("0"),
                    inline: true,
                }
            )
            .setTimestamp()
            .setFooter({
                text: interaction.client.user.tag,
                iconURL: interaction.client.user.displayAvatarURL(),
            })

        const giveaway = await db.Giveaways.create({
            uuid: uuid,
            guildId: interaction.guildId,
            userId: interaction.user.id,
            item: itemOption,
            winners: winnersOption,
            endDate: ends,
            channelId: textChannel.id,
            requirements:
                [
                    requirement1Option?.role?.id,
                    requirement2Option?.role?.id,
                    requirement3Option?.role?.id,
                ]
                    .filter((requirement) => requirement)
                    .join() || null,
        })

        const message = await textChannel.send({
            content: guildPrefs.extraGiveawayMessage,
            embeds: [embed],
            components: [row],
        })

        giveaway.update({ messageId: message.id })

        await modalSubmitInteraction.reply({
            content: `Created! Check ${channelMention(
                textChannel.id
            )} to see your new giveaway!`,
            ephemeral: true,
        })

        await end(giveaway, interaction.client as QuadraticClient)
    },
}
