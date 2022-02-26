const { bold } = require("@discordjs/builders")
const { Op } = require("sequelize")
const { v4: uuidv4 } = require("uuid")
const db = require("./database.js")
module.exports = async (interaction) => {
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
