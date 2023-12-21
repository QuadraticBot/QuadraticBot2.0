import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    bold,
} from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with latency and uptime."),
    execute: async (interaction: ChatInputCommandInteraction) => {
        let message = `Pong!\nLatency: ${bold(
            interaction.client.ws.ping.toString()
        )}ms.`
        let totalSeconds = interaction.client.uptime / 1000
        const days = Math.floor(totalSeconds / 86400)
        totalSeconds %= 86400
        const hours = Math.floor(totalSeconds / 3600)
        totalSeconds %= 3600
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = Math.floor(totalSeconds % 60)
        const uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`
        message = message + `\nMy uptime is ${bold(uptime)}!`
        await interaction.reply({ content: message, ephemeral: true })
    },
}
