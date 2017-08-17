import utils from '../utils/utils'
import _ from 'underscore'

export default (msg, logger, vouches, blocked, workingGuild, singleList, CONFIG) => {
	const userId = msg.mentions.users.array()[0].id
	const authorId = msg.author.id
	if (utils.hasVouches(userId, vouches) && utils.isModerator(authorId, workingGuild)) {
		return singleList(msg, logger, blocked, vouches, CONFIG)
			.then(() => {
				return msg.channel.send(
					'Please enter the `id` of the vouch you would like to remove from the user. \n For example `2`.'
				)
			})
			.then(m => {
				return m.channel.awaitMessages(message => message.author.id === authorId, {
					max: 1,
					time: 10000,
					errors: ['time'],
				})
			})
			.then(answers => {
				return removeVouches(answers.array()[0], vouches, userId)
			})
			.catch(answers => {
				msg.reply('You didn`t answer within the 15 seconds time frame. Try again!')
				return Promise.resolve(vouches)
			})
	}

	return Promise.resolve(vouches)
}

const removeVouches = (answers, vouches, userId) => {
	const ids = answers.cleanContent
		.split(',')
		.map(id => parseInt(id, 10) - 1)
		.filter(id => id < vouches[userId].length && id >= 0)

	ids.forEach(id => {
		vouches[userId].splice(id, 1)
	})

	return vouches
}
