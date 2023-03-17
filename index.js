import { readdir } from "fs/promises"
import { Client, Collection, GatewayIntentBits } from "discord.js"
import config from "./config.json" assert { type: "json" }

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.commands = new Collection()
client.contextMenus = new Collection()
client.buttons = new Collection()

const commandFolders = await readdir("./commands")
for (const folder of commandFolders) {
	const commandFiles = await readdir(`./commands/${folder}`)

	for (const file of commandFiles) {
		const { default: command } = await import(
			`./commands/${folder}/${file}`
		)
		client.commands.set(command.data.name, command)
	}
}

const contextMenus = await readdir("./contextMenus")

for (const contextMenuFile of contextMenus) {
	const { default: contextMenu } = await import(
		`./contextMenus/${contextMenuFile}`
	)
	client.contextMenus.set(contextMenu.data.name, contextMenu)
}

const buttonFiles = await readdir("./buttons")

for (const buttonFile of buttonFiles) {
	const { default: contextMenu } = await import(`./buttons/${buttonFile}`)
	client.buttons.set(contextMenu.name, contextMenu)
}

const eventFiles = await readdir("./events")

for (const file of eventFiles) {
	const { default: event } = await import(`./events/${file}`)
	try {
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args))
		} else {
			client.on(event.name, (...args) => event.execute(...args))
		}
	} catch (error) {
		console.error(error)
	}
}

process.on("uncaughtException", (error) =>
	console.error(
		`There was an uncaught error:`,
		error.stack ?? error.toString()
	)
)

client.login(config.token)
