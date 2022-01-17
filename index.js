const fs = require("fs")
const { Client, Collection, Intents } = require("discord.js")
const { token } = require("./config.json")

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.commands = new Collection()

const commandFolders = fs.readdirSync("./commands")

commandFolders.forEach((folder) => {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"))

    commandFiles.forEach((file) => {
        const command = require(`./commands/${folder}/${file}`)
        client.commands.set(command.data.name, command)
    })
})

const eventFiles = fs
    .readdirSync("./events")
    .filter((file) => file.endsWith(".js"))

eventFiles.forEach((file) => {
    const event = require(`./events/${file}`)
    try {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args))
        } else {
            client.on(event.name, (...args) => event.execute(...args))
        }
    } catch (error) {
        console.error(error)
    }
})

process.on("uncaughtException", (error) => {
    console.error(
        `There was an uncaught error:\n${error.stack ?? error.toString()}`
    )
})

client.login(token)
