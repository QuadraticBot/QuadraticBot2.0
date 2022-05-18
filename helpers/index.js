import { Op } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import { userMention, time as timestamp, bold } from "@discordjs/builders"
import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js"
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
    if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
        throw new Error("Link buttons are not supported.")
    if (buttonList.length !== 2) throw new Error("Need two buttons.")

    let page = 0

    const button1 = new MessageButton(buttonList[0])
    if (page < 1) {
        button1.setDisabled(true)
    }
    const button2 = new MessageButton(buttonList[1])
    if (page + 2 > pages.length) {
        button2.setDisabled(true)
    }
    const row = new MessageActionRow().addComponents(button1, button2)

    const currentPage = await interaction.reply({
        embeds: [
            new MessageEmbed(pages[page]).setFooter({
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
        const button1 = new MessageButton(buttonList[0])
        if (page < 1) {
            button1.setDisabled(true)
        }
        const button2 = new MessageButton(buttonList[1])
        if (page + 2 > pages.length) {
            button2.setDisabled(true)
        }
        const newRow = new MessageActionRow().addComponents(button1, button2)
        await i.editReply({
            embeds: [
                new MessageEmbed(pages[page]).setFooter({
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

export const end = async (giveaway, client, instant, rerollWinners) => {
    const time = instant ? 0 : giveaway.endDate - Date.now()

    console.log(
        `Ender executed for giveaway ${giveaway.uuid}. Ending in ${
            time > 0 ? time : 0
        }.`
    )

    smartTimeout(
        async () => {
            await giveaway.reload()
            if (giveaway.isFinished && !rerollWinners)
                return console.log("Giveaway already ended")

            const guildPrefs = await db.GuildPrefs.findOne({
                where: {
                    guildId: giveaway.guildId,
                },
            })

            const channel = await client.channels.fetch(
                guildPrefs.giveawayChannelId
            )

            try {
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
                                    Math.floor(giveaway.endDate / 1000),
                                    "R"
                                ),
                                inline: true,
                            },
                            {
                                name: "Requirements",
                                value: (
                                    message.embeds[0].fields[2] ??
                                    message.embeds[0].fields[1]
                                ).value,
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
                        .setColor("#14bbaa")
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
                        content: `${
                            rerollWinners ? "Rerolled. " : ""
                        }Hosted by: ${userMention(giveaway.userId)}.`,
                        embeds: [embed2],
                    })
                }

                const winnerNames = []

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
                        Math.random() * entrants.length
                    )
                    winnerNames[i] = userMention(
                        entrantsList[winnerIndex].userId
                    )
                    entrantsList.splice(winnerIndex, 1)
                }

                const embed = new MessageEmbed(message.embeds[0])
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
                                Math.floor(giveaway.endDate / 1000),
                                "R"
                            ),
                        },
                        {
                            name: "Requirements",
                            value: (
                                message.embeds[0].fields[2] ??
                                message.embeds[0].fields[1]
                            ).value,
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
                console.log(
                    `Giveaway ${giveaway.uuid} ended with ${entrants.length} entrants.`
                )
            } catch (error) {
                if (error.code == 10008) {
                    console.log("Message deleted, removing giveaway")
                    await giveaway.update({
                        isFinished: true,
                    })
                }
                console.error(error)
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
        console.log(
            `${interaction.user.tag} (${interaction.user.id}) is entering the giveaway ${giveaway.item} (${giveaway.uuid}). The message id is ${interaction.message.id}`
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

        if (result[1])
            await interaction.reply({
                content: `You have successfully entered the giveaway for ${bold(
                    giveaway.item
                )}!`,
                ephemeral: true,
            })
        else
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
            return console.log("Modal timed out")

        console.error(error)

        try {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            })
        } catch (error) {
            if (error.code == "INTERACTION_ALREADY_REPLIED")
                console.log("Modal error")
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
            return console.log("Modal timed out")

        console.error(error)

        try {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            })
        } catch (error) {
            if (error.code == "INTERACTION_ALREADY_REPLIED")
                console.log("Modal error")
        }
    }
}
