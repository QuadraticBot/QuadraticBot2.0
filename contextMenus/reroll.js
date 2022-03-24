const { ContextMenuCommandBuilder } = require("@discordjs/builders")
const { ApplicationCommandType } = require("discord-api-types/v9")
const { Modal, MessageActionRow, TextInputComponent } = require("discord.js")
const addModal = require("../helpers/addModal")
const db = require("../helpers/database.js")
const end = require("../helpers/end")

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Reroll Giveaway")
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

        if (interaction.user.id != giveaway.userId)
            return await interaction.reply({
                content: "You are not the giveaway hoster.",
                ephemeral: true,
            })

        if (!giveaway.isFinished)
            return await interaction.reply({
                content: "The giveaway has not ended yet.",
                ephemeral: true,
            })

        const row = new MessageActionRow().addComponents(
            new TextInputComponent()
                .setCustomId("newWinners")
                .setLabel("Number of winners to reroll")
                .setPlaceholder("Number of Winners")
                .setRequired(true)
                .setStyle("SHORT")
        )

        const modal = new Modal()
            .setCustomId(`modal-${interaction.id}`)
            .addComponents([row])
            .setTitle("Reroll")

        const modalSubmitInteraction = await addModal(interaction, modal)

        const winnersOption =
            modalSubmitInteraction.fields.getTextInputValue("newWinners")

        if (!Number(winnersOption) || Number(winnersOption) < 1)
            return await modalSubmitInteraction.reply({
                content: "Winnners must be a number greater than 0.",
                ephemeral: true,
            })

        end(giveaway, interaction.client, true, winnersOption)

        await modalSubmitInteraction.reply({
            content: "Giveaway Rerolled.",
            ephemeral: true,
        })
    },
}
