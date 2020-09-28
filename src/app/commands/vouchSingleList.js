import moment from 'moment'
import Discord from 'discord.js'
import utils from '../utils/utils'
import _ from 'lodash'

const CHUNKCOUNT = 5

export default (msg, logger, blocked, vouches, CONFIG) => {
	const user = msg.mentions.users.array()[0]
	if (user != undefined && user != null && vouches && vouches[user.id]) {
		const userVouches = vouches[user.id]
		const chunkes = _.chunk(userVouches, CHUNKCOUNT) // [[5],[5]]
		let currentChunk = 0

		const simpleEmbed = footer => createEmbedded(msg, user.id, CONFIG, footer)

		const listMessage = msg.channel
			.send({
				embed: fillEmbedded(
					simpleEmbed(`${currentChunk + 1} / ${chunkes.length} Pages`),
					chunkes[currentChunk],
					currentChunk
				),
			})
			.then(message => message.react('⬅'))
			.then(reaction => reaction.message.react('➡').then(reaction => reaction.message))

		pageNavigationAwaiting(
			listMessage,
			chunkes,
			currentChunk,
			simpleEmbed,
			msg.author.id
		).catch(message => {
			return message.clearReactions()
		})

		return listMessage
	}

	msg.channel.send("❓ Either the user is unknown to me or the user hasn't any vouches yet.")
}

const pageNavigationAwaiting = (listMessage, chunkes, currentChunk, simpleEmbed, authorId) => {
	return listMessage
		.then(message =>
			message.awaitReactions(
				(reaction, author) =>
					checkReactionAwait(reaction, author, authorId, chunkes.length, currentChunk),
				{
					max: 1,
					time: 15000,
					errors: ['time'],
				}
			)
		)
		.then(collection => {
			const first = collection.array()[0]

			if (!first) {
				return
			}

			if (first.emoji.name == '➡') {
				currentChunk += 1
			} else if (first.emoji.name == '⬅') {
				currentChunk -= 1
			}

			return pageNavigationAwaiting(
				first.message
					.edit({
						embed: fillEmbedded(
							simpleEmbed(`${currentChunk + 1} / ${chunkes.length} Pages`),
							chunkes[currentChunk],
							currentChunk
						),
					})
					.then(message => {
						return message
					}),
				chunkes,
				currentChunk,
				simpleEmbed,
				authorId
			)
		})
		.catch(() => {
			return listMessage.then(message => {
				message.clearReactions()
			})
		})
}

const checkReactionAwait = (messageReaction, author, authorId, chunkesLen, currentIndex) => {
	const correctAuthor = author.id == authorId
	const MustBeEmoji = messageReaction.emoji.name == '➡' || messageReaction.emoji.name == '⬅'

	if (correctAuthor && MustBeEmoji) {
		if (currentIndex == 0 && messageReaction.emoji.name == '⬅') return false
		else if (currentIndex == chunkesLen - 1 && messageReaction.emoji.name == '➡') {
			return false
		} else return true
	} else {
		return false
	}
}

const fillEmbedded = (embed, chunk, count) => {
	let newEmbed = embed
	chunk.forEach((field, index) => {
		newEmbed = addVouchField(newEmbed, CHUNKCOUNT * count + index + 1, field)
	})
	return newEmbed
}

const createEmbedded = (msg, userId, CONFIG, footer) => {
	return new Discord.RichEmbed()
		.setTitle(`${utils.findGuildMember(userId, msg)} newest Vouches`)
		.setAuthor('VouchJS')
		.setColor(0xffffff)
		.setFooter(footer)
		.setTimestamp()
}

const addVouchField = (embed, index, { description, proof, time, user }) => {
	return embed.addField(
		index + '. vouch at ' + moment.unix(time).format('MMM Do YY, h:mm:ss a '),
		`voucher: <@${user}> \nproof: ${proof} \ndescription: ${description}`
	)
}
