import {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    PermissionsBitField,
    MessageContextMenuCommandInteraction,
} from "discord.js"
import { db } from "../helpers/database.js"

export default {
    data: new ContextMenuCommandBuilder()
        .setName("Cancel Giveaway")
        .setType(ApplicationCommandType.Message),
    execute: async (interaction: MessageContextMenuCommandInteraction) => {
        if (!interaction.inCachedGuild())
            return await interaction.reply({
                content:
                    "An error occurred. Are you attempting to use this command in a DM?",
            })

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

        if (
            interaction.user.id != giveaway.userId &&
            interaction.member.permissions.has(
                PermissionsBitField.Flags.ManageMessages
            )
        )
            return await interaction.reply({
                content: "You are not the host of this giveaway.",
                ephemeral: true,
            })

        if (giveaway.isFinished)
            return await interaction.reply({
                content: "The giveaway has already ended.",
                ephemeral: true,
            })

        await giveaway.update({ isFinished: true })

        await interaction.targetMessage.delete()

        await interaction.reply({
            content: "Giveaway Canceled.",
            ephemeral: true,
        })
    },
}
