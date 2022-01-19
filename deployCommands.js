const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { clientId, devGuildId, token } = require("./config.json")

const commands = []

const commandFolders = fs.readdirSync("./commands")

commandFolders.forEach((folder) => {
    const commandFiles = fs.readdirSync(`./commands/${folder}`)

    commandFiles.forEach((file) => {
        const command = require(`./commands/${folder}/${file}`)
        commands.push(command.data.toJSON())
    })
})

const rest = new REST({ version: "9" }).setToken(token)

rest.put(
    process.env.DEVELOPMENT
        ? Routes.applicationGuildCommands(clientId, devGuildId)
        : Routes.applicationCommands(clientId),
    { body: commands }
)
    .then(() =>
        console.log(
            `Deployed all application commands to ${
                process.env.DEVELOPMENT
                    ? `test server (${devGuildId})`
                    : "all servers"
            }.`
        )
    )
    .catch(console.error)
