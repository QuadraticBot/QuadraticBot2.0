import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    PermissionsBitField,
} from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite me to your server!"),
    execute: async (interaction) => {
        const button = new ButtonBuilder()
            .setURL(
                interaction.client.generateInvite({
                    permissions: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.EmbedLinks,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.MentionEveryone,
                    ],
                    scopes: ["applications.commands", "bot"],
                })
            )
            .setLabel("Invite Me")
            .setStyle("LINK")

        const row = new ActionRowBuilder().addComponents(button)
        await interaction.reply({
            content: "Click the button below to invite me to your server.",
            components: [row],
            ephemeral: true,
        })
    },
}
