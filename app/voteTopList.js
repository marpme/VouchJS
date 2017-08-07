const Discord = require('discord.js')
const moment = require('moment')

exports.showTopList = (msg, vouches, client, VERSION) => {
	const embed = new Discord.RichEmbed()
		.setTitle('Traders - TOP 10 list')
		.setAuthor('VouchJS', client.user.avatarURL)
		.setColor(0xffffff)
		.setFooter(
			'© VouchJS (' + VERSION + ')',
			client.user.avatarURL
		)
		.setThumbnail(client.user.avatarURL)
		.setTimestamp()
	// .addField(
	// 	'This is a field title, it can hold 256 characters',
	// 	'This is a field value, it can hold 2048 characters.',
	// 	'blash',
	// 	'blub'
	// );
	const findGuildMember = id => {
		const user = msg.guild.members
			.map(member => member.user)
			.find(user => user.id === id)
		return user != null
			? user.tag
			: 'User not longer in Guild'
	}

	const userVouchesMap = Object.keys(vouches)
		.map(key => ({
			key,
			count: vouches[key].length,
			lastInsert: vouches[key][0]
		}))
		.sort((prev, next) => next.count - prev.count)
		.slice(0, 10)

	userVouchesMap.forEach((vouch, index) => {
		embed.addField(
			index + 1 + '. ' + findGuildMember(vouch.key),
			'with **' +
				vouch.count +
				' vouches** | Last Trade with ' +
				findGuildMember(vouch.lastInsert.user) +
				' at ' +
				moment
					.unix(vouch.lastInsert.time)
					.format('DD-MM-YYYY h:mm:ss a')
		)
	})

	msg.channel.send({ embed })
}
