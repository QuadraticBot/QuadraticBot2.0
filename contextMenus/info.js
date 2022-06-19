import {
    ContextMenuCommandBuilder,
    roleMention,
    bold,
    time as timestamp,
} from "@discordjs/builders"
import { ApplicationCommandType } from "discord-api-types/v9"
import { MessageEmbed } from "discord.js"
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

        const infoEmbed = new MessageEmbed()
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
            .addField("Entrants:", bold(entrants.length), true)
            .addField("Winners:", bold(giveaway.winners), true)
            .addField(
                `${giveaway.isFinished ? "Ended" : "Ends"}:`,
                giveaway.isFinished
                    ? giveaway.endDate > Date.now()
                        ? "Early"
                        : time
                    : time,
                true
            )
            .addField(
                "Requirements:",
                giveaway.requirements
                    ?.split(",")
                    .map((requirement) => roleMention(requirement))
                    .join(", ") || "None",
                true
            )

        await interaction.reply({
            content: null,
            embeds: [infoEmbed],
            ephemeral: true,
        })
    },
}
