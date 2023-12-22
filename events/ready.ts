import { db } from "../helpers/database.js"
import { end } from "../helpers/end.js"
import { QuadraticClient } from "../models/quadraticClient.js"

export default {
    name: "ready",
    once: true,
    execute: async (client: QuadraticClient) => {
        console.info(`Ready! Logged in as ${client.user.tag}`)
        try {
            await db.Sequelize.authenticate()
            console.info("Connection has been established successfully.")
        } catch (error) {
            console.error("Unable to connect to the database:", error)
        }

        await db.Sequelize.sync()

        const giveaways = await db.Giveaways.findAll({
            where: { isFinished: false },
        })

        giveaways.forEach((giveaway) => end(giveaway, client))
    },
}
