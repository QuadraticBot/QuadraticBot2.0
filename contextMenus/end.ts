import {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    MessageContextMenuCommandInteraction,
} from "discord.js"
import { db } from "../helpers/database.js"
import { end } from "../helpers/end.js"
import { QuadraticClient } from "../models/quadraticClient.js"

export default {
    data: new ContextMenuCommandBuilder()
        .setName("End Giveaway")
        .setType(ApplicationCommandType.Message),
    execute: async (interaction: MessageContextMenuCommandInteraction) => {
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

        if (interaction.user.id != giveaway.userId)
            return await interaction.reply({
                content: "You are not the host of this giveaway.",
                ephemeral: true,
            })

        if (giveaway.isFinished)
            return await interaction.reply({
                content: "The giveaway has already ended.",
                ephemeral: true,
            })

        await end(giveaway, interaction.client as QuadraticClient, true)
        await interaction.reply({
            content: "Giveaway Ended.",
            ephemeral: true,
        })
    },
}
