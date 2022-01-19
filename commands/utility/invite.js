const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageActionRow, MessageButton, Permissions } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite me to your server!"),
    execute: async (interaction) => {
        const button = new MessageButton()
            .setURL(
                interaction.client.generateInvite({
                    permissions: [
                        Permissions.FLAGS.VIEW_CHANNEL,
                        Permissions.FLAGS.EMBED_LINKS,
                        Permissions.FLAGS.SEND_MESSAGES,
                        Permissions.FLAGS.MENTION_EVERYONE,
                    ],
                    scopes: ["applications.commands", "bot"],
                })
            )
            .setLabel("Invite Me")
            .setStyle("LINK")

        const row = new MessageActionRow().addComponents(button)
        await interaction.reply({
            content: "Click the button below to invite me to your server.",
            components: [row],
            ephemeral: true,
        })
    },
}
