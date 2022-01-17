const { Op } = require("sequelize")
const { v4: uuidv4 } = require("uuid")
module.exports = {
    name: "buttonInteraction",
    async execute(interaction, db) {
        const giveaway = await db.Giveaways.findOne({
            where: { messageId: interaction.message.id },
        })
        if (!giveaway)
            return interaction.reply(
                "There was an error. Please try again later."
            )
        console.log(
            interaction.user.tag +
                ` entered giveaway the giveaway with the message id ${messageId}!`
        )
        const userId = interaction.user.id
        const member = interaction.member
        console.log(
            `Giveaway ${giveaway.uuid} for ${giveaway.item} has been taken out of the table.`
        )
        if (giveaway.requirements) {
            await member.fetch()
            const roles = giveaway.requirements.split(",")
            if (!member.roles.cache.hasAll(...roles)) {
                return await interaction.editReply({
                    content:
                        "You do not have the required roles to enter this giveaway.",
                    ephemeral: true,
                })
            }
        }

        if (
            interaction.message.embeds[0].author.name == interaction.user.tag &&
            interaction.message.embeds[0].author.name !=
                interaction.client.application?.owner.tag
        ) {
            return await interaction.editReply({
                content: "You cannot enter your own giveaway.",
                ephemeral: true,
            })
        }

        let result = await db.Entrants.findOrCreate({
            where: {
                [Op.and]: [{ giveawayUuid: giveaway.uuid }, { userId: userId }],
            },
            defaults: {
                uuid: uuidv4(),
                userId: userId,
                giveawayUuid: giveaway.uuid,
            },
        })

        let created = result[1]

        if (created) {
            await interaction.editReply({
                content:
                    "You have successfully entered the giveaway for **" +
                    giveaway.item +
                    "**!",
                ephemeral: true,
            })
        } else {
            await interaction.editReply({
                content:
                    "You already entered the giveaway for **" +
                    giveaway.item +
                    "**.",
                ephemeral: true,
            })
        }
    },
}
