import { SlashCommandBuilder } from "discord.js"
import { ActionRowBuilder, ButtonBuilder } from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Report bugs and get help."),
    execute: async (interaction) => {
        const button1 = new ButtonBuilder()
            .setURL("https://www.henryhiles.com/#contact")
            .setLabel("Contact Me (General Questions)")
            .setStyle("LINK")

        const button2 = new ButtonBuilder()
            .setURL("https://github.com/Henry-Hiles/QuadraticBot2.0/issues")
            .setLabel("Github Issues (Report Bugs)")
            .setStyle("LINK")

        const row = new ActionRowBuilder().addComponents(button1, button2)

        await interaction.reply({
            content: "Get support here:",
            components: [row],
            ephemeral: true,
        })
    },
}
