import {
    buttonInteraction,
    commandInteraction,
    contextMenuInteraction,
} from "helpers"

export default {
    name: "interactionCreate",
    execute: async (interaction) => {
        if (interaction.isCommand()) commandInteraction(interaction)
        else if (interaction.isButton()) buttonInteraction(interaction)
        else if (interaction.isContextMenu())
            contextMenuInteraction(interaction)
    },
}
