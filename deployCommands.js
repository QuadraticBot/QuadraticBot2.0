import fs from "fs"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { clientId, token, devGuildId } from "./config.json"

const commands = []

const commandFolders = fs.readdirSync("./commands")

for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"))

    for (const file of commandFiles) {
        const command = await import(`./commands/${folder}/${file}`)
        commands.push(command.data.toJSON())
    }
}

const contextMenuFiles = fs.readdirSync("./contextMenus")

for (const contextMenuFile of contextMenuFiles) {
    const contextMenu = await import(`./contextMenus/${contextMenuFile}`)
    commands.push(contextMenu.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(token)

rest.put(
    devGuildId
        ? Routes.applicationGuildCommands(clientId, devGuildId)
        : Routes.applicationCommands(clientId),
    { body: commands }
)
    .then(() =>
        console.log(
            `Deployed all application commands to ${
                devGuildId ? `test server (${devGuildId})` : "all servers"
            }.`
        )
    )
    .catch(console.error)
