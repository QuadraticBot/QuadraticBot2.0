import {
	Client,
	Collection,
	ClientOptions,
	SlashCommandBuilder,
	CommandInteraction,
	InteractionResponse,
	ContextMenuCommandInteraction,
	ContextMenuCommandBuilder,
	ButtonInteraction
} from "discord.js"

export class QuadraticClient extends Client {
	commands: Collection<
		string,
		{
			data: SlashCommandBuilder
			execute(
				interaction: CommandInteraction
			): Promise<InteractionResponse<boolean>>
		}
	>
	contextMenus: Collection<
		string,
		{
			data: ContextMenuCommandBuilder
			execute: (
				interaction: ContextMenuCommandInteraction
			) => Promise<InteractionResponse<boolean>>
		}
	>
	buttons: Collection<
		string,
		{
			name: string
			execute: (
				interaction: ButtonInteraction
			) => Promise<InteractionResponse<boolean>>
		}
	>

	constructor(options: ClientOptions) {
		super(options)
		this.commands = new Collection()
		this.contextMenus = new Collection()
		this.buttons = new Collection()
	}
}
