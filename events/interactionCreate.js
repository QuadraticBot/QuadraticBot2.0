module.exports = {
    name: "interactionCreate",
    execute: async (interaction) => {
        if (interaction.isCommand())
            interaction.client.emit("commandInteraction", interaction)
        else interaction.isButton()
    },
}
