import {
    bold,
    hyperlink,
    userMention,
    TextChannel,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    Colors,
} from "discord.js"
import { Giveaway, db } from "./database.js"
import { msTimestamp, randomIndex, smartTimeout } from "./utilities.js"
import { QuadraticClient } from "../models/quadraticClient.js"
import enterButton from "../components/enterButton.js"
import { Winner } from "../models/winner.js"

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
                return console.warn(
                    "Giveaway already ended, but ender still executed"
                )

            const guildPrefs = await db.GuildPrefs.findOne({
                where: {
                    guildId: giveaway.guildId,
                },
            })

            try {
                const guild = await client.guilds.fetch(guildPrefs.guildId)
                const channel = await guild.channels.fetch(
                    giveaway.channelId || guildPrefs.giveawayChannelId
                )

                if (!(channel instanceof TextChannel))
                    return console.warn(
                        "Giveaway ended, but channel not TextChannel"
                    )

                const message = await channel.messages.fetch(giveaway.messageId)

                const entrants = await db.Entrants.findAll({
                    where: {
                        giveawayUuid: giveaway.uuid,
                    },
                })

                const winners: Winner[] = []

                if (entrants.length != 0) {
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

                        winners[i] = new Winner(
                            entrantsList[winnerIndex].userId,
                            userMention(entrantsList[winnerIndex].userId)
                        )

                        entrantsList.splice(winnerIndex, 1)
                    }
                }

                const winnerNames = winners
                    .map((winner) => winner.mention)
                    .join(", ")

                const giveawayEmbed = EmbedBuilder.from(message.embeds[0])
                    .setTimestamp()
                    .setTitle(
                        `Giveaway Complete! ${
                            entrants.length == 0 ? "Nobody joined..." : ""
                        }`
                    )
                    .setFields(
                        winnerNames
                            ? {
                                  name: "Won by:",
                                  value: bold(winnerNames),
                                  inline: true,
                              }
                            : {
                                  name: "Nobody joined",
                                  value: "No winners",
                                  inline: true,
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
                                      : msTimestamp(giveaway.endDate, "R"),
                                  inline: true,
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
                        const member = await guild.members.fetch(winner.id)

                        const dmEmbed = new EmbedBuilder()
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
                                embeds: [dmEmbed],
                            })
                        } catch (error) {
                            if (error.code !== 50007) throw error // If user has DMs off, ignore
                        }
                    }

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    ButtonBuilder.from(enterButton).setDisabled(true)
                )

                await message.edit({
                    embeds: [giveawayEmbed],
                    components: [row],
                })

                const replyEmbed = new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setTitle("Giveaway Ended!")
                    .setDescription(`Giveaway for ${bold(giveaway.item)}!`)
                    .setFields(
                        winnerNames
                            ? {
                                  name: "Won by:",
                                  value: winnerNames,
                              }
                            : { name: "Nobody joined", value: "No winners" }
                    )
                    .setTimestamp()
                    .setFooter({
                        text: message.client.user.tag,
                        iconURL: message.client.user.displayAvatarURL(),
                    })

                const extraSlots =
                    (rerollWinners || giveaway.winners) - entrants.length

                await message.reply({
                    content: `${rerollWinners ? "Rerolled. " : ""}${
                        winnerNames
                            ? `Won by ${winnerNames}!`
                            : "Nobody joined."
                    } Hosted by: ${userMention(giveaway.userId)}.${
                        extraSlots > 0 && winnerNames
                            ? ` The last ${
                                  extraSlots > 1
                                      ? `${extraSlots} winner slots were`
                                      : "winner slot was"
                              } not chosen as there were not enough entrants.`
                            : ""
                    }`,
                    embeds: [replyEmbed],
                })
                await giveaway.update({ isFinished: true })
                console.info(
                    `Giveaway ${giveaway.uuid} has ended with ${entrants.length} entrants.`
                )
            } catch (error) {
                if (error.code == 10008) {
                    console.info("Message deleted, removing giveaway")
                    await giveaway.update({
                        isFinished: true,
                    })
                } else if (error.code == 10003) {
                    console.info("Channel deleted, removing giveaway")
                    await giveaway.update({
                        isFinished: true,
                    })
                } else if (error.code == 50001) {
                    console.info("Bot is no longer in guild, removing giveaway")
                    await giveaway.update({
                        isFinished: true,
                    })
                } else throw error
            }
        },
        time > 0 ? time : 0
    )
}
