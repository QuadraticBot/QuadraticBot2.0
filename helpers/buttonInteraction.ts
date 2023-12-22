import { ButtonInteraction } from "discord.js"
import { QuadraticClient } from "../models/quadraticClient.js"

export const buttonInteraction = async (interaction: ButtonInteraction) => {
    const button = (interaction.client as QuadraticClient).buttons.get(
        interaction.customId
    )
    if (!button) return

    try {
        await button.execute(interaction)
    } catch (error) {
        console.error(error)

        try {
            await interaction.reply({
                content: "There was an error while executing this button!",
                ephemeral: true,
            })
        } catch (error) {
            console.error(error)
        }
    }
}
