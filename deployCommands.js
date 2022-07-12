import fs from "fs"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import config from "./config.json" assert { type: "json" }

const commands = []

const commandFolders = fs.readdirSync("./commands")

for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"))

    for (const file of commandFiles) {
        const { default: command } = await import(
            `./commands/${folder}/${file}`
        )
        commands.push(command.data.toJSON())
    }
}

const contextMenuFiles = fs.readdirSync("./contextMenus")

for (const contextMenuFile of contextMenuFiles) {
    const { default: contextMenu } = await import(
        `./contextMenus/${contextMenuFile}`
    )
    commands.push(contextMenu.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(config.token)

rest.put(
    config.devGuildId
        ? Routes.applicationGuildCommands(config.clientId, config.devGuildId)
        : Routes.applicationCommands(config.clientId),
    { body: commands }
)
    .then(() =>
        console.info(
            `Deployed all application commands to ${
                config.devGuildId
                    ? `test server (${config.devGuildId})`
                    : "all servers"
            }.`
        )
    )
    .catch(console.error)
