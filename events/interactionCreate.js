import {
    buttonInteraction,
    commandInteraction,
    contextMenuInteraction,
} from "helpers"

export default {
    name: "interactionCreate",
    execute: async (interaction) => {
        if (interaction.isContextMenuCommand())
            return contextMenuInteraction(interaction)
        if (interaction.isCommand()) return commandInteraction(interaction)
        if (interaction.isButton()) return buttonInteraction(interaction)
    },
}
