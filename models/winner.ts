import { Snowflake } from "discord.js"

export class Winner {
    id: Snowflake
    mention: string

    constructor(id: Snowflake, mention: string) {
        this.id = id
        this.mention = mention
    }
}
