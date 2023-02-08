import {
    EmbedBuilder,
    SlashCommandBuilder,
    ApplicationCommandType,
    chatInputApplicationCommandMention,
} from "discord.js"
import config from "../../config.json" assert { type: "json" }

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help for this bot."),
    execute: async (interaction) => {
        const embed = new EmbedBuilder().setTitle("Help").setColor("#14bbaa")

        const commands = await interaction.client.application.commands.fetch({
            guildId: config.devGuildId,
        })

        commands
            .sort((commandA, commandB) => commandA.type - commandB.type)
            .forEach((command) =>
                embed.addFields({
                    name: chatInputApplicationCommandMention(
                        command.name,
                        command.id
                    ),
                    value:
                        command.type == ApplicationCommandType.Message
                            ? "This is a context menu"
                            : command.description || "No description",
                })
            )

        await interaction.reply({
            content: null,
            ephemeral: true,
            embeds: [embed],
        })
    },
}
