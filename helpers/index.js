import { Op } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import {
    userMention,
    time as timestamp,
    bold,
    hyperlink,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js"
import { Sequelize, DataTypes, Model } from "sequelize"
const sequelize = new Sequelize({
    logging: false,
    dialect: "sqlite",
    storage: "database.sqlite",
})

class Giveaway extends Model {}
Giveaway.init(
    {
        uuid: {
            type: DataTypes.UUID,
            unique: true,
            primaryKey: true,
        },
        userId: DataTypes.STRING,
        guildId: DataTypes.STRING,
        channelId: DataTypes.STRING,
        item: DataTypes.STRING,
        winners: DataTypes.INTEGER,
        endDate: DataTypes.STRING,
        requirements: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        messageId: DataTypes.STRING,
        isFinished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    { sequelize, modelName: "giveaway" }
)

class Entrant extends Model {}
Entrant.init(
    {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
        },
        userId: DataTypes.STRING,
        giveawayUuid: {
            type: DataTypes.UUID,
            foreignKey: true,
        },
    },
    { sequelize, modelName: "entrant" }
)
class GuildPref extends Model {}
GuildPref.init(
    {
        guildId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        giveawayChannelId: DataTypes.STRING,
        extraGiveawayMessage: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        DMUsers: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    { sequelize, modelName: "GuildPref" }
)
Giveaway.hasMany(Entrant)
Entrant.belongsTo(Giveaway)

export const db = {
    GuildPrefs: GuildPref,
    Entrants: Entrant,
    Giveaways: Giveaway,
    Sequelize: sequelize,
}

export const smartTimeout = (callback, time) => {
    const MAX_TIME = 2147483647
    let smartTime = 0
    if (time > MAX_TIME) smartTime = MAX_TIME

    setTimeout(() => {
        if (!smartTime) callback()
        else smartTimeout(callback, time - smartTime)
    }, smartTime || time)
}

export const paginator = async (
    interaction,
    pages,
    buttonList,
    pageName,
    timeout = 120000
) => {
    if (!pages) throw new Error("Pages are not given.")
    if (!buttonList) throw new Error("Buttons are not given.")
    if (
        buttonList[0].style === ButtonStyle.Link ||
        buttonList[1].style === ButtonStyle.Link
    )
        throw new Error("Link buttons are not supported.")
    if (buttonList.length !== 2) throw new Error("Need two buttons.")

    let page = 0

    const button1 = new ButtonBuilder(buttonList[0])
    if (page < 1) {
        button1.setDisabled(true)
    }
    const button2 = new ButtonBuilder(buttonList[1])
    if (page + 2 > pages.length) {
        button2.setDisabled(true)
    }
    const row = new ActionRowBuilder().addComponents(button1, button2)

    const currentPage = await interaction.reply({
        embeds: [
            new EmbedBuilder(pages[page]).setFooter({
                text: `${pageName} ${page + 1} / ${pages.length}`,
            }),
        ],
        components: [row],
        content: null,
        ephemeral: true,
        fetchReply: true,
    })

    const filter = (i) =>
        i.customId === buttonList[0].customId ||
        i.customId === buttonList[1].customId

    const collector = await currentPage.createMessageComponentCollector({
        filter,
        time: timeout,
    })

    collector.on("collect", async (i) => {
        await i.deferUpdate()
        switch (i.customId) {
            case buttonList[0].customId:
                page = page > 0 ? --page : pages.length - 1
                break
            case buttonList[1].customId:
                page = page + 1 < pages.length ? ++page : 0
                break
            default:
                break
        }
        const button1 = new ButtonBuilder(buttonList[0])
        if (page < 1) {
            button1.setDisabled(true)
        }
        const button2 = new ButtonBuilder(buttonList[1])
        if (page + 2 > pages.length) {
            button2.setDisabled(true)
        }
        const newRow = new ActionRowBuilder().addComponents(button1, button2)
        await i.editReply({
            embeds: [
                new EmbedBuilder(pages[page]).setFooter({
                    text: `${pageName} ${page + 1} / ${pages.length}`,
                }),
            ],
            components: [newRow],
            content: null,
        })
        collector.resetTimer()
    })

    collector.on("end", () => {
        if (!currentPage.deleted) currentPage.delete()
    })

    return currentPage
}

export const msTimestamp = (time, type) =>
    timestamp(Math.floor(time / 1000), type)

export const end = async (giveaway, client, instant, rerollWinners) => {
    const time = instant ? 0 : giveaway.endDate - Date.now()

    console.info(
        `Ender executed for giveaway ${giveaway.uuid}. Ending in ${
            time > 0 ? time : 0
        }.`
    )

    smartTimeout(
        async () => {
            await giveaway.reload()
            if (giveaway.isFinished && !rerollWinners)
                return console.info("Giveaway already ended")

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

                const message = await channel.messages.fetch(giveaway.messageId)

                const entrants = await db.Entrants.findAll({
                    where: {
                        giveawayUuid: giveaway.uuid,
                    },
                })

                if (entrants.length == 0) {
                    const embed = EmbedBuilder.from(message.embeds[0]).setTitle(
                        "Giveaway Complete! Nobody joined..."
                    )

                    !rerollWinners &&
                        embed.setFields(
                            {
                                name: "Ended",
                                value: instant
                                    ? `Early (${msTimestamp(Date.now(), "R")})`
                                    : msTimestamp(giveaway.endDate, "R"),
                            },
                            {
                                name: "Requirements",
                                value: (
                                    message.embeds[0].fields[2] ??
                                    message.embeds[0].fields[1]
                                ).value,
                            }
                        )

                    const row = new ActionRowBuilder().addComponents(
                        ButtonBuilder.from(
                            message.components[0].components[0]
                        ).setDisabled(true)
                    )

                    await message.edit({
                        embeds: [embed],
                        components: [row],
                    })

                    const embed2 = new EmbedBuilder()
                        .setColor("#14bbaa")
                        .setTitle("Giveaway Ended!\nNobody joined...")
                        .setDescription(`Giveaway for ${bold(giveaway.item)}!`)
                        .addFields([
                            { name: "Won by", value: "Nobody", inline: true },
                        ])
                        .setTimestamp()
                        .setFooter({
                            text: message.client.user.tag,
                            iconURL: message.client.user.displayAvatarURL({
                                dynamic: true,
                            }),
                        })
                    await giveaway.update({ isFinished: true })
                    return await message.reply({
                        content: `${
                            rerollWinners ? "Rerolled. " : ""
                        }Hosted by: ${userMention(giveaway.userId)}.`,
                        embeds: [embed2],
                    })
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
                    const winnerIndex = Math.floor(
                        Math.random() * entrantsList.length
                    )

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
                            value: bold(winnerNames.join(", ")),
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
                                embeds: [embed],
                            })
                        } catch (error) {
                            if (error.code === 50007)
                                console.info("User has DMs turned off.")
                            else throw error
                        }
                    }

                const row = new ActionRowBuilder().addComponents(
                    ButtonBuilder.from(
                        message.components[0].components[0]
                    ).setDisabled(true)
                )

                await message.edit({
                    embeds: [embed],
                    components: [row],
                })

                const embed2 = new EmbedBuilder()
                    .setColor("#14bbaa")
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
                    embeds: [embed2],
                })
                await giveaway.update({ isFinished: true })
                console.info(
                    `Giveaway ${giveaway.uuid} ended with ${entrants.length} entrants.`
                )
            } catch (error) {
                if (error.code == 10008) {
                    console.info("Message deleted, removing giveaway")
                    return await giveaway.update({
                        isFinished: true,
                    })
                } else if (error.code == 10003) {
                    console.info("Channel deleted, removing giveaway")
                    return await giveaway.update({
                        isFinished: true,
                    })
                }

                throw error
            }
        },
        time > 0 ? time : 0
    )
}

export const buttonInteraction = async (interaction) => {
    try {
        const giveaway = await db.Giveaways.findOne({
            where: { uuid: interaction.customId },
        })

        if (!giveaway)
            return interaction.reply({
                content: "There was an error. Please try again later.",
                ephemeral: true,
            })

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
                ephemeral: true,
            })

        if (!interaction.client.application.owner)
            await interaction.client.application.fetch()

        if (
            interaction.user.id != interaction.client.application?.owner.id &&
            giveaway.userId == interaction.user.id
        )
            return await interaction.reply({
                content: "You cannot enter your own giveaway.",
                ephemeral: true,
            })

        console.info(
            `${interaction.user.tag} (${interaction.user.id}) has entered the giveaway for ${giveaway.item} (${giveaway.uuid})`
        )

        const result = await db.Entrants.findOrCreate({
            where: {
                [Op.and]: [
                    { giveawayUuid: giveaway.uuid },
                    { userId: interaction.user.id },
                ],
            },
            defaults: {
                uuid: uuidv4(),
                userId: interaction.user.id,
                giveawayUuid: giveaway.uuid,
            },
        })

        if (result[1]) {
            const newEmbed = interaction.message.embeds[0]
            const entrantsField = newEmbed.fields.find(
                (field) => field.name == "Entrants"
            )

            entrantsField.value = bold(
                Number(
                    entrantsField.value.slice(2, entrantsField.value.length - 2)
                ) + 1
            )

            interaction.message.edit({
                embeds: [EmbedBuilder.from(interaction.message.embeds[0])],
            })

            return await interaction.reply({
                content: `You have successfully entered the giveaway for ${bold(
                    giveaway.item
                )}!`,
                ephemeral: true,
            })
        }

        await interaction.reply({
            content: "You already entered this giveaway.",
            ephemeral: true,
        })
    } catch (error) {
        console.error(error)
        await interaction.reply({
            content: "There was an error while executing this button!",
            ephemeral: true,
        })
    }
}

export const commandInteraction = async (interaction) => {
    const command = interaction.client.commands.get(interaction.commandName)
    if (!command) return

    try {
        await command.execute(interaction)
    } catch (error) {
        if (error.code == "INTERACTION_COLLECTOR_ERROR")
            return console.info("Modal timed out")

        console.error(error)

        try {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            })
        } catch (error) {
            if (error.code == "INTERACTION_ALREADY_REPLIED")
                console.info("Modal error")
        }
    }
}

export const addModal = async (sourceInteraction, modal, timeout = 120000) => {
    await sourceInteraction.showModal(modal)
    return await sourceInteraction.awaitModalSubmit({
        time: timeout,
        filter: (filterInteraction) =>
            filterInteraction.customId === `modal-${sourceInteraction.id}`,
    })
}

export const contextMenuInteraction = async (interaction) => {
    const command = interaction.client.contextMenus.get(interaction.commandName)
    if (!command) return

    try {
        await command.execute(interaction)
    } catch (error) {
        if (error.code == "INTERACTION_COLLECTOR_ERROR")
            return console.info("Modal timed out")

        console.error(error)

        try {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            })
        } catch (error) {
            if (error.code == "INTERACTION_ALREADY_REPLIED")
                console.warn("Modal error")
        }
    }
}
