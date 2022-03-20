const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Report bugs and get help."),
    execute: async (interaction) => {
        const button1 = new MessageButton()
            .setURL("https://www.henryhiles.com/#contact")
            .setLabel("Contact Me (For General Questions)")
            .setStyle("LINK")

        const button2 = new MessageButton()
            .setURL("https://github.com/Henry-Hiles/QuadraticBot2.0/issues")
            .setLabel("Github Issues (Report Bugs)")
            .setStyle("LINK")

        const row = new MessageActionRow().addComponents(button1, button2)

        await interaction.reply({
            content: "Get support here:",
            components: [row],
            ephemeral: true,
        })
    },
}
