import {
	ActionRowBuilder,
	ButtonComponent,
	TextChannel,
	hyperlink
} from "discord.js"
import { ButtonBuilder } from "discord.js"
import { EmbedBuilder, bold, userMention } from "discord.js"
import { Giveaway, db } from "./database.js"
import { msTimestamp, randomIndex, smartTimeout } from "./utilities.js"
import { QuadraticClient } from "./quadraticClient.js"

export const end = async (
	giveaway: Giveaway,
	client: QuadraticClient,
	instant: boolean = false,
	rerollWinners?: number
) => {
	let time = giveaway.endDate - Date.now()
	time = instant || time < 0 ? 0 : time

	console.info(
		`Ender executed for giveaway ${giveaway.uuid}. Ending in ${time}.`
	)

	smartTimeout(
		async () => {
			await giveaway.reload()
			if (giveaway.isFinished && !rerollWinners)
				return console.info("Giveaway already ended")

			const guildPrefs = await db.GuildPrefs.findOne({
				where: {
					guildId: giveaway.guildId
				}
			})

			try {
				const guild = await client.guilds.fetch(guildPrefs.guildId)
				const channel = await guild.channels.fetch(
					giveaway.channelId || guildPrefs.giveawayChannelId
				)
				if (!(channel instanceof TextChannel))
					return console.log(
						"Giveaway ended, but channel not TextChannel"
					)

				const message = await channel.messages.fetch(giveaway.messageId)

				const entrants = await db.Entrants.findAll({
					where: {
						giveawayUuid: giveaway.uuid
					}
				})

				if (entrants.length == 0) {
					const embed = EmbedBuilder.from(message.embeds[0]).setTitle(
						"Giveaway Complete! Nobody joined..."
					)

					if (!rerollWinners)
						embed.setFields(
							{
								name: "Ended",
								value: instant
									? `Early (${msTimestamp(Date.now(), "R")})`
									: msTimestamp(giveaway.endDate, "R")
							},
							{
								name: "Requirements",
								value: (
									message.embeds[0].fields[2] ??
									message.embeds[0].fields[1]
								).value
							}
						)

					const enterButton = message.components[0].components[0]

					if (!(enterButton instanceof ButtonComponent))
						return console.log(
							"Giveaway ended, but enterButton not ButtonComponent"
						)
				}

				const winnerNames = []
				const winners = []

				const entrantsList = [...entrants]

				for (
					let i = 0;
					i <
					((rerollWinners || giveaway.winners) > entrants.length
						? entrants.length
						: rerollWinners || giveaway.winners);
					i++
				) {
					const winnerIndex = randomIndex(entrantsList)

					winnerNames[i] = userMention(
						entrantsList[winnerIndex].userId
					)
					winners[i] = entrantsList[winnerIndex].userId

					entrantsList.splice(winnerIndex, 1)
				}

				const embed = EmbedBuilder.from(message.embeds[0])
					.setTitle("Giveaway Complete!")
					.setFields(
						{
							name: "Won by:",
							value: bold(winnerNames.join(", "))
						},
						rerollWinners
							? message.embeds[0].fields.find(
									(field) =>
										field.name == "Ends" ||
										field.name == "Ended"
							  )
							: {
									name: "Ended",
									value: instant
										? `Early (${msTimestamp(
												Date.now(),
												"R"
										  )})`
										: msTimestamp(giveaway.endDate, "R")
							  },
						message.embeds[0].fields.find(
							(field) => field.name == "Requirements"
						),
						message.embeds[0].fields.find(
							(field) => field.name == "Entrants"
						)
					)

				if (guildPrefs.DMUsers)
					for (const winner of winners) {
						const member = await guild.members.fetch(winner)

						const embed = new EmbedBuilder()
							.setTitle(
								`You just won the giveaway for ${bold(
									giveaway.item
								)}!`
							)
							.setDescription(
								`${hyperlink("Jump to message", message.url)}.`
							)

						try {
							await member.send({
								content: null,
								embeds: [embed]
							})
						} catch (error) {
							if (error.code === 50007)
								console.info("User has DMs turned off.")
							else throw error
						}
					}

				const enterButton = message.components[0].components[0]
				if (!(enterButton instanceof ButtonComponent))
					return console.log(
						"Giveaway ended, enterButton not ButtonComponent"
					)

				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
					ButtonBuilder.from(enterButton).setDisabled(true)
				)

				await message.edit({
					embeds: [embed],
					components: [row]
				})

				const embed2 = new EmbedBuilder()
					.setColor("#14bbaa")
					.setTitle("Giveaway Ended!")
					.setDescription(`Giveaway for ${bold(giveaway.item)}!`)
					.addFields({
						name: "Won by:",
						value: winnerNames.join(", ")
					})
					.setTimestamp()
					.setFooter({
						text: message.client.user.tag,
						iconURL: message.client.user.displayAvatarURL()
					})
				await message.reply({
					content: `${
						rerollWinners ? "Rerolled. " : ""
					}Won by ${winnerNames.join(", ")}! Hosted by: ${userMention(
						giveaway.userId
					)}.\n ${
						(rerollWinners || giveaway.winners) > entrants.length
							? `The last ${
									(rerollWinners || giveaway.winners) -
										entrants.length ==
									1
										? "winner slot was"
										: `${
												(rerollWinners ||
													giveaway.winners) -
												entrants.length
										  } winner slots were`
							  } not chosen as there were not enough entrants.`
							: ""
					}`,
					embeds: [embed2]
				})
				await giveaway.update({ isFinished: true })
				console.info(
					`Giveaway ${giveaway.uuid} ended with ${entrants.length} entrants.`
				)
			} catch (error) {
				if (error.code == 10008) {
					console.info("Message deleted, removing giveaway")
					return await giveaway.update({
						isFinished: true
					})
				} else if (error.code == 10003) {
					console.info("Channel deleted, removing giveaway")
					return await giveaway.update({
						isFinished: true
					})
				} else if (error.code == 50001) {
					console.info("Bot no longer in guild, removing giveaway")
					return await giveaway.update({
						isFinished: true
					})
				}

				throw error
			}
		},
		time > 0 ? time : 0
	)
}
