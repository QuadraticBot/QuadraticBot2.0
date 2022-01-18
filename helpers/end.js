const Discord = require("discord.js");
module.exports = async (db, time, giveaway, message, endTime) => {
	if(!message.channel.guild) await message.fetch();
	if(!message.channel.guild) return;
	console.log(`Ender executed for giveaway ${giveaway.uuid}. Ending in ${time}.`);
	let timeout = 0;
	if (time > 0) {
		timeout = time;
	}
	setTimeout( async () => {
		endTime = Math.floor( endTime / 1000 );
		let entrants = await db.Entrants.findAll( {
			where: {
				giveawayUuid: giveaway.uuid,
			},
		} );
		console.log(`Giveaway ${giveaway.uuid} ended with ${entrants.length} entrants.`);
		let winners = [];
		let winnerNames = [];
		let extraText = "";
		let requirements = message.embeds[0].fields[2]
		if(requirements)
		{
			requirements = requirements.value
		}
		let hosters = await message.channel.guild.members.search({query: message.embeds[0].author.name.substring(0, message.embeds[0].author.name.length - 5)})
		hosters.filter(member => member.user.discriminator == message.embeds[0].author.name.substring(message.embeds[0].author.name.length - 4))
		let hoster = message.embeds[0].author.name
		if(hosters != null)	hoster = hosters.first()
		
		let winnerCount = giveaway.winners;
		if ( entrants.length == 0 ) {
			const embed = new Discord.MessageEmbed()
				.setColor( "#0099ff" )
				.setTitle( "Giveaway Complete! Nobody joined..." )
				.setAuthor( message.embeds[0].author.name, message.embeds[0].iconURl )
				.setThumbnail( "https://gifimage.net/wp-content/uploads/2017/11/gift-gif-14.gif" )
				.setDescription( "Giveaway for **" + giveaway.item + "**!" )
				.addFields(
					{ name: "Ended", value: "**<t:" + endTime + ":R>.**", inline: true }
				)
				.setTimestamp()
				.setFooter(
					message.client.user.tag,
					message.client.user.displayAvatarURL({dynamic: true})
				);
			if(requirements) embed.addFields({name: "Requirements", value: requirements, inline: true})
			await message.edit( {
				embeds: [embed],
				components: [],
			} );
			const embed2 = new Discord.MessageEmbed()
				.setColor( "#0099ff" )
				.setTitle( "Giveaway Ended!\nNobody joined..." )
				.setDescription( "Giveaway for **" + giveaway.item + "**!" )
				.addFields( { name: "Won by", value: "Nobody" } )
				.setTimestamp()
				.setFooter(
					message.client.user.tag,
					message.client.user.displayAvatarURL({dynamic: true})
				);
			await giveaway.update( { isFinished: true } );
			return await message.reply( {
				content: `Hosted by:  ${hoster}.`,
				embeds: [embed2],
			} );
		} else if ( entrants.length < winnerCount ) {
			let otherWinners = winnerCount - entrants.length;
			if ( otherWinners == 1 ) {
				extraText = ` The other winner was not chosen, as there were not enough entrants.`;
			} else {
				extraText = ` The other ${otherWinners} winners were not chosen, as there were not enough entrants.`;
				winnerCount = entrants.length;
			}
		}

		let entrantList = entrants;
		for ( let index = 0; index < winnerCount; index++ ) {
			let winnerIndex = Math.floor( Math.random() * entrants.length );
			winners[index] = entrantList[winnerIndex];
			entrantList.splice( winnerIndex, 1 );
		}

		winners.forEach( winner => {
			winnerNames.push( `<@!${winner.userId}>` );
		} );

		const embed = new Discord.MessageEmbed()
			.setColor( "#0099ff" )
			.setTitle( "Giveaway Complete!" )
			.setDescription( "Giveaway for **" + giveaway.item + "**!" )
			.setAuthor( message.embeds[0].author.name, message.embeds[0].iconURl )
			.setThumbnail( "https://gifimage.net/wp-content/uploads/2017/11/gift-gif-14.gif" )
			.addFields(
				{
					name: "Won by:",
					value: `**${winnerNames.join( ", " )}!**`,
					inline: true
				},
				{
					name: "Ended:",
					value: "**<t:" + endTime + ":R>.**",
					inline: true
				}
			)
			.setTimestamp()
			.setFooter(
				message.client.user.tag,
				message.client.user.displayAvatarURL({dynamic: true})
			);
		if(requirements) embed.addFields({name: "Requirements", value: "**" + requirements + "**", inline: true})
		await message.edit( {
			content: null,
			embeds: [embed],
			components: [],
		} );
		const embed2 = new Discord.MessageEmbed()
			.setColor( "#0099ff" )
			.setTitle( "Giveaway Ended!" )
			.setDescription( "Giveaway for **" + giveaway.item + "**!" )
			.addFields( {
				name: "Won by:",
				value: `**${winnerNames.join( ", " )}**!`,
			} )
			.setTimestamp()
			.setFooter(
				message.client.user.tag,
				message.client.user.displayAvatarURL({dynamic: true})
			);
		await message.reply( {
			content: `Won by ${winnerNames.join( ", " )}! Hosted by: ${hoster}.\n` + extraText,
			embeds: [embed2],
		} );
		await giveaway.update( { isFinished: true } );
	}, timeout );
}

