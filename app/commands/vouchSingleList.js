import moment from 'moment'
import Discord from 'discord.js'
import utils from '../utils/utils'

const createEmbedded = (msg, userId, CONFIG) => {
	return new Discord.RichEmbed()
		.setTitle(`${utils.findGuildMember(userId, msg)} lastest vouches (< 30 days)`)
		.setAuthor('VouchJS')
		.setColor(0xffffff)
		.setFooter('© VouchJS (' + CONFIG.version + ')')
		.setTimestamp()
}

const addVouchField = (embed, index, { description, proof, time, user }) => {
	return embed.addField(
		index + 1 + '. vouch at ' + moment.unix(time).format('MMM Do YY, h:mm:ss a '),
		`voucher: <@${user}> \nproof: ${proof} \ndescription: ${description}`
	)
}

export default (msg, logger, blocked, vouches, CONFIG) => {
	let users = msg.mentions.users.array()
	let uniqueMetion = [...new Set(users)]

	uniqueMetion
		.map(
			({ id }) =>
				!utils.isUserBlocked(id, blocked) && utils.hasVouches(id, vouches)
					? { id, vouches: vouches[id] }
					: { id, vouches: [] }
		)
		.map(({ id, vouches }) => {
			const embed = createEmbedded(msg, id, CONFIG)
			if (utils.isUserBlocked(id, blocked)) {
				return embed.addField(
					'Blocked User',
					`The User (<@${id}>) has been blocked, so there aren't any vouches for him.`
				)
			}

			const lastestVouches = vouches.filter(vouch => {
				const time = moment.unix(vouch.time)
				return moment().diff(time, 'days') < 30
			})

			return lastestVouches.length > 0
				? lastestVouches.reduce(
						(currentEmbed, vouch, index) =>
							addVouchField(currentEmbed, lastestVouches.length - (index + 1), vouch),
						embed
					)
				: embed.addField(
						'No latest vouches',
						'this user hasn`t got any vouch in the last 30 days'
					)
		})
		.forEach(embed => msg.channel.send({ embed }).then(message => message.delete(60000)))
}
