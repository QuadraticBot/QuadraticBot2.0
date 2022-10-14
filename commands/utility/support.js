import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Report bugs and get help."),
    execute: async (interaction) => {
        const button1 = new ButtonBuilder()
            .setURL("https://www.henryhiles.com/#contact")
            .setLabel("Contact Me")
            .setStyle(ButtonStyle.Link)

        const button2 = new ButtonBuilder()
            .setURL(
                "https://github.com/Henry-Hiles/QuadraticBot2.0/issues/new?template=bug_report.md"
            )
            .setLabel("Report Bugs")
            .setStyle(ButtonStyle.Link)

        const button3 = new ButtonBuilder()
            .setURL(
                "https://github.com/Henry-Hiles/QuadraticBot2.0/issues/new?template=feature_request.md"
            )
            .setLabel("Request a Feature")
            .setStyle(ButtonStyle.Link)

        const button4 = new ButtonBuilder()
            .setURL(
                "https://discord.gg/qAuf27YQry"
            )
            .setLabel("Join the Discord")
            .setStyle(ButtonStyle.Link)

        const row = new ActionRowBuilder().addComponents(
            button1,
            button2,
            button3,
            button4
        )

        await interaction.reply({
            content: "Get support here:",
            components: [row],
            ephemeral: true,
        })
    },
}
