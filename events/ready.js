const db = require("../helpers/database.js")
module.exports = {
    name: "ready",
    once: true,
    execute: async (client) => {
        console.log(`Ready! Logged in as ${client.user.tag}`)
        try {
            await db.Sequelize.authenticate()
            console.log("Connection has been established successfully.")
        } catch (error) {
            console.error("Unable to connect to the database:", error)
        }

        await db.Sequelize.sync()
    },
}
