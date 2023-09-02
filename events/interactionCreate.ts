import { contextMenuInteraction } from "../helpers/contextMenuInteraction.js"
import { commandInteraction } from "../helpers/commandInteraction.js"
import { buttonInteraction } from "../helpers/buttonInteraction.js"
import { Interaction } from "discord.js"

export default {
	name: "interactionCreate",
	execute: async (interaction: Interaction) => {
		if (interaction.isContextMenuCommand())
			return contextMenuInteraction(interaction)
		if (interaction.isCommand()) return commandInteraction(interaction)
		if (interaction.isButton()) return buttonInteraction(interaction)
	}
}
