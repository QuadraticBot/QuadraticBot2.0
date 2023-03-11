import { Op } from "sequelize"
import { bold } from "discord.js"
import { db } from "./database.js"
import { EmbedBuilder } from "discord.js"
import { v4 as uuidv4 } from "uuid"

export const buttonInteraction = async (interaction) => {
	try {
		const giveaway = await db.Giveaways.findOne({
			where: { uuid: interaction.customId }
		})

		if (giveaway) {
			console.info(
				`${interaction.user.tag} (${interaction.user.id}) is attempting to enter the giveaway ${giveaway.item} (${giveaway.uuid}) The message id is ${interaction.message.id}`
			)

			if (
				giveaway.requirements &&
				!interaction.member.roles.cache.hasAll(
					...giveaway.requirements.split(",")
				)
			)
				return await interaction.reply({
					content:
						"You do not have the required roles to enter this giveaway.",
					ephemeral: true
				})

			if (!interaction.client.application.owner)
				await interaction.client.application.fetch()

			if (
				interaction.user.id !=
					interaction.client.application?.owner.id &&
				giveaway.userId == interaction.user.id
			)
				return await interaction.reply({
					content: "You cannot enter your own giveaway.",
					ephemeral: true
				})

			console.info(
				`${interaction.user.tag} (${interaction.user.id}) has entered the giveaway for ${giveaway.item} (${giveaway.uuid})`
			)

			const result = await db.Entrants.findOrCreate({
				where: {
					[Op.and]: [
						{ giveawayUuid: giveaway.uuid },
						{ userId: interaction.user.id }
					]
				},
				defaults: {
					uuid: uuidv4(),
					userId: interaction.user.id,
					giveawayUuid: giveaway.uuid
				}
			})

			if (result[1]) {
				const newEmbed = interaction.message.embeds[0]
				const entrantsField = newEmbed.fields.find(
					(field) => field.name == "Entrants"
				)

				entrantsField.value = bold(
					Number(
						entrantsField.value.slice(
							2,
							entrantsField.value.length - 2
						)
					) + 1
				)

				interaction.message.edit({
					embeds: [EmbedBuilder.from(interaction.message.embeds[0])]
				})

				return await interaction.reply({
					content: `You have successfully entered the giveaway for ${bold(
						giveaway.item
					)}!`,
					ephemeral: true
				})
			}

			await interaction.reply({
				content: "You already entered this giveaway.",
				ephemeral: true
			})
		} else {
			return interaction.reply({
				content: "There was an error. Please try again later.",
				ephemeral: true
			})
		}
	} catch (error) {
		console.error(error)
		await interaction.reply({
			content: "There was an error while executing this button!",
			ephemeral: true
		})
	}
}
