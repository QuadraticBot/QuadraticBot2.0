import { db } from "../helpers/database.js"
import { msTimestamp } from "../helpers/utilities.js"
import {
	ContextMenuCommandBuilder,
	EmbedBuilder,
	ApplicationCommandType,
	roleMention
} from "discord.js"

export default {
	data: new ContextMenuCommandBuilder()
		.setName("Giveaway Info")
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

		const entrants = await db.Entrants.findAll({
			where: {
				giveawayUuid: giveaway.uuid
			}
		})

		const time = msTimestamp(giveaway.endDate, "R")

		const infoEmbed = new EmbedBuilder()
			.setColor("#14bbaa")
			.setTitle(`Giveaway for ${giveaway.item}`)
			.setAuthor(interaction.targetMessage.embeds[0].author)
			.setTimestamp()
			.setFooter({
				text: interaction.client.user.tag,
				iconURL: interaction.client.user.displayAvatarURL({
					dynamic: true
				})
			})
			.addFields(
				{
					name: "Entrants:",
					value: `${entrants.length} entrant${
						entrants.length == 1 ? "" : "s"
					}`
				},
				{
					name: "Winners:",
					value: `${giveaway.winners} winner${
						giveaway.winners == 1 ? "" : "s"
					}`
				},
				{
					name: `${giveaway.isFinished ? "Ended" : "Ends"}:`,
					value: giveaway.isFinished
						? giveaway.endDate > Date.now()
							? `Early`
							: time
						: time
				},
				{
					name: "Requirements:",
					value:
						giveaway.requirements
							?.split(",")
							.map((requirement) => roleMention(requirement))
							.join(", ") || "None"
				}
			)

		await interaction.reply({
			content: null,
			embeds: [infoEmbed],
			ephemeral: true
		})
	}
}
