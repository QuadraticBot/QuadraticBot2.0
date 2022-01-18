const buttonInteraction = require("../helpers/buttonInteraction")
const commandInteraction = require("../helpers/commandInteraction")

module.exports = {
    name: "interactionCreate",
    execute: async (interaction) => {
        if (interaction.isCommand()) commandInteraction(interaction)
        else if (interaction.isButton()) buttonInteraction(interaction)
    },
}
