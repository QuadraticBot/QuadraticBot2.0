const { SlashCommandBuilder, bold } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    execute: async (interaction) => {
        let message = `Pong!\nLatency: ${bold(interaction.client.ws.ping)}.`
        let totalSeconds = interaction.client.uptime / 1000
        let days = Math.floor(totalSeconds / 86400)
        totalSeconds %= 86400
        let hours = Math.floor(totalSeconds / 3600)
        totalSeconds %= 3600
        let minutes = Math.floor(totalSeconds / 60)
        let seconds = Math.floor(totalSeconds % 60)
        let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`
        message = message + `\nMy uptime is ${bold(uptime)}!`
        await interaction.reply({ content: message, ephemeral: true })
    },
}
