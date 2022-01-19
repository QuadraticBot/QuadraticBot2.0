const { userMention, time: timestamp, bold } = require("@discordjs/builders")
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const db = require("./database.js")
module.exports = async (giveaway, client) => {
    const time = giveaway.endDate - Date.now()
    console.log(
        `Ender executed for giveaway ${giveaway.uuid}. Ending in ${
            time > 0 ? time : 0
        }.`
    )
    setTimeout(
        async () => {
            const guildPrefs = await db.GuildPrefs.findOne({
                where: {
                    guildId: giveaway.guildId,
                },
            })

            const channel = await client.channels.fetch(
                guildPrefs.giveawayChannelId
            )

            const message = await channel.messages.fetch(giveaway.messageId)

            const entrants = await db.Entrants.findAll({
                where: {
                    giveawayUuid: giveaway.uuid,
                },
            })

            if (entrants.length == 0) {
                const embed = new MessageEmbed(message.embeds[0])
                    .setTitle("Giveaway Complete! Nobody joined...")
                    .setFields(
                        {
                            name: "Ended",
                            value: timestamp(
                                Math.floor((time + Date.now()) / 1000),
                                "R"
                            ),
                            inline: true,
                        },
                        {
                            name: "Requirements",
                            value: message.embeds[0].fields[2].value,
                            inline: true,
                        }
                    )

                const row = new MessageActionRow().addComponents(
                    new MessageButton(
                        message.components[0].components[0]
                    ).setDisabled(true)
                )

                await message.edit({
                    embeds: [embed],
                    components: [row],
                })

                const embed2 = new MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle("Giveaway Ended!\nNobody joined...")
                    .setDescription(`Giveaway for ${bold(giveaway.item)}!`)
                    .addField("Won by", "Nobody")
                    .setTimestamp()
                    .setFooter({
                        text: message.client.user.tag,
                        iconURL: message.client.user.displayAvatarURL({
                            dynamic: true,
                        }),
                    })
                await giveaway.update({ isFinished: true })
                return await message.reply({
                    content: `Hosted by: ${userMention(giveaway.userId)}.`,
                    embeds: [embed2],
                })
            }

            const winnerNames = []

            const entrantList = [...entrants]

            for (
                let i = 0;
                i <
                (giveaway.winners > entrants.length
                    ? entrants.length
                    : giveaway.winners);
                i++
            ) {
                const winnerIndex = Math.floor(Math.random() * entrants.length)
                winnerNames[i] = userMention(entrantList[winnerIndex].userId)
                entrantList.splice(winnerIndex, 1)
            }

            const embed = new MessageEmbed()
                .setTitle("Giveaway Complete!")
                .setFields(
                    {
                        name: "Won by:",
                        value: bold(winnerNames.join(", ")),
                        inline: true,
                    },
                    {
                        name: "Ended",
                        value: timestamp(
                            Math.floor((time + Date.now()) / 1000),
                            "R"
                        ),
                    },
                    {
                        name: "Requirements",
                        value: message.embeds[0].fields[2].value,
                    }
                )
            await message.edit({
                content: null,
                embeds: [embed],
                components: [],
            })
            const embed2 = new MessageEmbed()
                .setColor("#0099ff")
                .setTitle("Giveaway Ended!")
                .setDescription(`Giveaway for ${bold(giveaway.item)}!`)
                .addFields({
                    name: "Won by:",
                    value: winnerNames.join(", "),
                })
                .setTimestamp()
                .setFooter({
                    text: message.client.user.tag,
                    iconURL: message.client.user.displayAvatarURL({
                        dynamic: true,
                    }),
                })
            await message.reply({
                content: `Won by ${winnerNames.join(
                    ", "
                )}! Hosted by: ${userMention(giveaway.userId)}.\n ${
                    giveaway.winners > entrants.length
                        ? `The last ${
                              giveaway.winners - entrants.length == 1
                                  ? "winner slot was"
                                  : `${
                                        giveaway.winners - entrants.length
                                    } winner slots were`
                          } not chosen as there were not enough entrants.`
                        : ""
                }`,
                embeds: [embed2],
            })
            await giveaway.update({ isFinished: true })
            console.log(
                `Giveaway ${giveaway.uuid} ended with ${entrants.length} entrants.`
            )
        },
        time > 0 ? time : 0
    )
}
