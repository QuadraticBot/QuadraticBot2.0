import { contextMenuInteraction } from "../helpers/contextMenuInteraction.js"
import { commandInteraction } from "../helpers/commandInteraction.js"
import { buttonInteraction } from "../helpers/buttonInteraction.js"

export default {
	name: "interactionCreate",
	execute: async (interaction) => {
		if (interaction.isContextMenuCommand())
			return contextMenuInteraction(interaction)
		if (interaction.isCommand()) return commandInteraction(interaction)
		if (interaction.isButton()) return buttonInteraction(interaction)
	}
}
