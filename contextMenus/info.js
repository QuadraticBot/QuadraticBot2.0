import {
    ContextMenuCommandBuilder,
    EmbedBuilder,
    ApplicationCommandType,
    roleMention,
    bold,
    time as timestamp,
} from "discord.js"
import { db } from "helpers"

export default {
    data: new ContextMenuCommandBuilder()
        .setName("Giveaway Info")
        .setType(ApplicationCommandType.Message),
    execute: async (interaction) => {
        const giveaway = await db.Giveaways.findOne({
            where: {
                messageId: interaction.targetId,
            },
        })

        if (!giveaway)
            return await interaction.reply({
                content: "That message is not a giveaway.",
                ephemeral: true,
            })

        const entrants = await db.Entrants.findAll({
            where: {
                giveawayUuid: giveaway.uuid,
            },
        })

        const time = timestamp(Math.floor(giveaway.endDate / 1000), "R")

        const infoEmbed = new EmbedBuilder()
            .setColor("#14bbaa")
            .setTitle(`Giveaway for ${giveaway.item}`)
            .setAuthor(interaction.targetMessage.embeds[0].author)
            .setTimestamp()
            .setFooter({
                text: interaction.client.user.tag,
                iconURL: interaction.client.user.displayAvatarURL({
                    dynamic: true,
                }),
            })
            .addFields(
                {
                    name: "Entrants:",
                    value: bold(entrants.length),
                    inline: true,
                },
                {
                    name: "Winners:",
                    value: bold(giveaway.winners),
                    inline: true,
                },
                {
                    name: `${giveaway.isFinished ? "Ended" : "Ends"}:`,
                    value: giveaway.isFinished
                        ? giveaway.endDate > Date.now()
                            ? "Early"
                            : time
                        : time,
                    inline: true,
                },
                {
                    name: "Requirements:",
                    value:
                        giveaway.requirements
                            ?.split(",")
                            .map((requirement) => roleMention(requirement))
                            .join(", ") || "None",
                    inline: true,
                }
            )

        await interaction.reply({
            content: null,
            embeds: [infoEmbed],
            ephemeral: true,
        })
    },
}
