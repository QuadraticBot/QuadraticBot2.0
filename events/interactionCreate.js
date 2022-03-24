const buttonInteraction = require("../helpers/buttonInteraction")
const commandInteraction = require("../helpers/commandInteraction")
const contextMenuInteraction = require("../helpers/contextMenuInteraction")

module.exports = {
    name: "interactionCreate",
    execute: async (interaction) => {
        if (interaction.isCommand()) commandInteraction(interaction)
        else if (interaction.isButton()) buttonInteraction(interaction)
        else if (interaction.isContextMenu())
            contextMenuInteraction(interaction)
    },
}
