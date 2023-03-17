# QuadraticBot 2.0

A simple, open-source, user-friendly Discord giveaway bot that uses the latest features, such as slash commands, timestamps, and buttons.

It's a rewrite of my original closed-source Discord bot, Quadratic Giveaways.

[Invite it to your server here](https://discord.com/api/oauth2/authorize?client_id=930172444910702653&permissions=150528&scope=applications.commands%20bot).

![Screenshot of giveaway](https://user-images.githubusercontent.com/71790868/151868878-75f6584d-24d5-4af8-8b2b-8a1e00e646d6.png)

[Changelog](https://github.com/Henry-Hiles/QuadraticBot2.0/blob/main/CHANGELOG.md)

## Command List

### Config: `/config`
Configure the bot to your needs. You must run `/config` before `/giveaway`.  

**Arguments**:  
❶ Channel (Required): Channel for giveaways to be created in.  
❷ Extra Text (Required): Extra text to be displayed along with your giveaways.  
❸ DMUsers (Required): DM users when they win a giveaway.


### Giveaway: `/giveaway`
Create a giveaway. You must run `/config` first.

**Arguments**  
Winners (Required): The number of winners for this giveaway.  
Item (Required): The item that is being given away.  
Minutes (Optional): The number of minutes for the giveaway to go on for.  
Hours (Optional): The number of hours for the giveaway to go on for.  
Days (Optional): The number of days for the giveaway to go on for.

### Invite: `/invite` Invite the bot to your server.

### Ping: `/ping` Check the ping and uptime of the bot.
---
## Technologies

This project was built using handcrafted Javascript and [Discord.js](https://discord.js.org/#/docs/discord.js/stable/general/welcome).

## Self-hosting

Though it is reccomended to use the main version of the bot, it is possible to self-host. Just create a `config.json` file at the root of the project with a format like this.   
![image](https://user-images.githubusercontent.com/71790868/155026869-8974c09f-a9dd-4d64-9659-c920646fb608.png)  
Note: Only include devGuildId when you would like commands to be deployed only there. Omiting it will cause commands to be deployed to all servers.

* To get a client id and token register a new application here: <https://discord.com/developers/applications>.
* To deploy your commands use `node deployCommands.js`.
* `pnpm` is reccomended.

If you use the bot publicly please give credit in the bots description. Thank you.

## Community
Discord server: https://discord.gg/XmF8GygG5N.  
Discussions: https://github.com/QuadraticBot/QuadraticBot2.0/discussions
