# QuadraticBot 2.0

A simple, open-source, user-friendly Discord giveaway bot that uses the latest features, such as slash commands, timestamps, and buttons.

It's a rewrite of my original closed-source Discord bot, Quadratic Giveaways.

[Invite it to your server here](https://discord.com/api/oauth2/authorize?client_id=930172444910702653&permissions=150528&scope=applications.commands%20bot).

![Screenshot from 2022-01-31 15-34-34](https://user-images.githubusercontent.com/71790868/151868878-75f6584d-24d5-4af8-8b2b-8a1e00e646d6.png)

## Command List

### Config: 
Configure the bot to your needs. You must run `/config` before `/giveaway`.  

**Arguments**:  
Channel (Required): Channel for giveaways to be created in.  
Extra Text (Required): Extra text to be displayed along with your giveaways.  
Giveaway Role (Required): The role requred to create giveaways. (Set to @everyone for no role)  


### Giveaway: 
Create a giveaway. You must run `/config` first.

**Arguments**  
Winners (Required): The number of winners for this giveaway.  
Item (Required): The item that is being given away.  
Minutes (Required): The number of minutes for the giveaway to go on for.  
Hours (Required): The number of hours for the giveaway to go on for.  
Days (Required): The number of days for the giveaway to go on for.

### Invite: Invite the bot to your server.

### Ping: Check the ping and uptime of the bot.
---
## Technologies

This project was built using handcrafted Javascript and [Discord.js](https://discord.js.org/#/docs/discord.js/stable/general/welcome).
