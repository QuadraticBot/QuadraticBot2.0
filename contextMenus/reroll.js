import {
	ContextMenuCommandBuilder,
	ModalBuilder,
	ApplicationCommandType,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle
} from "discord.js"
import { db } from "../helpers/database.js"
import { end } from "../helpers/end.js"
import { addModal } from "../helpers/utilities.js"

export default {
	data: new ContextMenuCommandBuilder()
		.setName("Reroll Giveaway")
		.setType(ApplicationCommandType.Message),
	execute: async (interaction) => {
		const giveaway = await db.Giveaways.findOne({
			where: {
				messageId: interaction.targetId
			}
		})

		if (!giveaway)
			return await interaction.reply({
				content: "That message is not a giveaway.",
				ephemeral: true
			})

		if (interaction.user.id != giveaway.userId)
			return await interaction.reply({
				content: "You are not the giveaway hoster.",
				ephemeral: true
			})

		if (!giveaway.isFinished)
			return await interaction.reply({
				content: "The giveaway has not ended yet.",
				ephemeral: true
			})

		const row = new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId("newWinners")
				.setLabel("Number of winners to reroll")
				.setPlaceholder("Number of Winners")
				.setRequired(true)
				.setStyle(TextInputStyle.Short)
		)

		const modal = new ModalBuilder()
			.setCustomId(`modal-${interaction.id}`)
			.addComponents([row])
			.setTitle("Reroll")

		const modalSubmitInteraction = await addModal(interaction, modal)

		const winnersOption =
			modalSubmitInteraction.fields.getTextInputValue("newWinners")

		if (!Number(winnersOption) || Number(winnersOption) < 1)
			return await modalSubmitInteraction.reply({
				content: "Winners must be a number greater than 0.",
				ephemeral: true
			})

		end(giveaway, interaction.client, true, winnersOption)

		await modalSubmitInteraction.reply({
			content: "Giveaway Rerolled.",
			ephemeral: true
		})
	}
}
