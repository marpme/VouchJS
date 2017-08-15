import utils from '../utils/utils'
import moment from 'moment'

let userHandled = []

export default (msg, vouches, blocked, workingGuild) => {
	if (
		msg.channel.id === workingGuild.marketplace &&
		(utils.countVouches(msg.author.id, vouches) < workingGuild.marketAccess ||
			utils.isUserBlocked(msg.author.id, blocked)) &&
		!userHandled.includes(msg.author.id)
	) {
		const filter = m => m.author.id === msg.author.id

		userHandled = [...userHandled, msg.author.id]

		msg.channel
			.awaitMessages(filter, { max: 100, time: 5000, errors: ['time'] })
			.then(collected => {
				userHandled = userHandled.filter(id => id != msg.author.id)
				handleSpam(
					msg,
					collected,
					`You are not allowed to access this channel. \nEither you are blocked or you don't have at least ${workingGuild.marketAccess} vouches.`
				)
			})
			.catch(collected => {
				userHandled = userHandled.filter(id => id != msg.author.id)
				handleSpam(
					msg,
					collected,
					`You are not allowed to access this channel. \nEither you are blocked or you don't have at least ${workingGuild.marketAccess} vouches.`
				)
			})
	} else if (
		msg.channel.id === workingGuild.marketplace &&
		!userHandled.includes(msg.author.id)
	) {
		msg.channel.fetchMessages({ limit: 100, before: msg.id }).then(messages => {
			const message = messages.array().find(message => message.author.id === msg.author.id)
			if (message) {
				const time = moment(message.createdTimestamp)
				const diff = moment().diff(time)
				if (diff < workingGuild.marketTimeout * 60 * 60) {
					const filter = m => m.author.id === msg.author.id
					userHandled = [...userHandled, msg.author.id]

					msg.channel
						.awaitMessages(filter, {
							max: 100,
							time: 5000,
							errors: ['time'],
						})
						.then(collected => {
							userHandled = userHandled.filter(id => id != msg.author.id)
							handleSpam(
								msg,
								collected,
								`You have to wait a bit more. You can only post once every ${workingGuild.marketTimeout} hour!`
							)
						})
						.catch(collected => {
							userHandled = userHandled.filter(id => id != msg.author.id)
							handleSpam(
								msg,
								collected,
								`You have to wait a bit more. You can only post once every ${workingGuild.marketTimeout} hour!`
							)
						})
				}
			}
		})
	}
}

const handleSpam = (msg, collected, text) => {
	msg.reply(text).then(message => message.delete(30000)).catch(console.log)
	const messages = [msg, ...collected.array()]
	messages.forEach(message => message.delete().catch(console.log))
}
