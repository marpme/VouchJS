import moment from 'moment'
import _ from 'underscore'
import utils from '../utils/utils'

export default function(
	msg,
	blocked,
	vouches,
	client,
	logger,
	updateUsername,
	CONFIG,
	workGuild,
	removeVouches,
	database
) {
	let users = msg.mentions.users.array()
	const then = moment.unix(msg.member.joinedTimestamp / 1000)
	const diff = moment().diff(then, 'hours')

	// check if the user wants to vouch himself
	if (users.find(user => user.id === msg.author.id) != undefined) {
		msg.reply(":no_entry: You can't vouch yourself, but nice try.")
		return Promise.resolve(vouches)
		// check if the voucher is blocker RIP
	} else if (utils.isUserBlocked(msg.author.id, blocked)) {
		msg.reply(":no_entry: You can't vouch anymore, you have been blocked.")
		return Promise.resolve(vouches)
	} else if (users.find(user => user.id === CONFIG.botID) != undefined) {
		msg.reply(
			":open_mouth: Great that you are loving our vouchbot, but you can't vouch for me! "
		)
		return Promise.resolve(vouches)
	} else if (msg.member != undefined && diff < 0) {
		msg.reply(
			`:no_entry_sign: You have to wait another ${72 -
				diff} hour(s) to get access to the vouch bot!`
		)
		return Promise.resolve(vouches)
	}

	let uniqueMetion = [...new Set(users)]

	return Promise.all(
		createVouchRequestForUsers(uniqueMetion, msg, vouches)
	).then(createdVouches => {
		const newVouches = createdVouches.reduce((prev, vouch) => {
			if (vouch == null) return vouches

			let { user, authorID, stamp, description, proof } = vouch
			if (prev[user.id] === undefined) {
				prev[user.id] = [
					{
						user: authorID,
						time: moment().unix(),
						description,
						proof,
					},
				]
			} else {
				prev[user.id].unshift({
					user: authorID,
					time: moment().unix(),
					description,
					proof,
				})
			}

			const reactionMessage = logger
				.vouchLog([
					{
						title: 'Trader were:',
						message: `between <@${authorID}> (voucher) and <@${user.id}> (vouched)`,
					},
					{
						title: `Description:`,
						message: description,
					},
					{
						title: `Proof:`,
						message: proof,
					},
				])
				.then(message => message.react('⛔'))

			// TODO: Maybe later Kappa
			reactionMessage.then(reaction => {
				return reaction.message
					.awaitReactions(reaction => reaction.emoji.toString() === '⛔', {
						max: 2,
						time: 8.64e7, // fuck it, these are 6 HOURS
						errors: ['time'],
					})
					.then(() => {
						const newUserVouch = removeVouches(
							{
								cleanContent: '1',
							},
							prev[user.id]
						)
						database
							.ref('/vouches')
							.once('value')
							.then(snapshot => {
								const currentVouches = snapshot.val()
								if (currentVouches[user.id]) {
									currentVouches[user.id] = newUserVouch
									database.ref('vouches').set(currentVouches)
									updateUsername(user.id, currentVouches, blocked)
								} else {
									throw 'Couldn`t set the real vouches for the current user!'
								}
							})
							.then(() => {
								reactionMessage.then(({ message }) => message.delete()).then(() => {
									logger.log(
										'Delete Vouch from User:',
										`Vouch has been revoked from user <@${user.id}>!`
									)
								})
							})
							.catch(err => {
								logger.err('VoteVouch:', err)
							})
					})
					.catch(err => {
						reactionMessage.then(({ message }) => message.clearReactions())
					})
			})

			updateUsername(user.id, prev, blocked)

			return prev
		}, vouches)

		return newVouches
	})
}

const createVouchRequestForUsers = (metionedUsers, msg, vouches) => {
	return metionedUsers.map(user => {
		// scrap through all vouches
		// check if we vote in last 12h for this user
		if (checkIf12HoursAreOver(vouches, user.id, msg.author.id)) {
			return addVouch(msg, user)
				.then(({ description, proof }) => {
					if (!validURL(proof)) throw 'PROOF'

					msg.reply(
						":white_check_mark: You've added " +
							user.tag +
							' a vouch. He gets notified aswell!'
					)
					return {
						user,
						authorID: msg.author.id,
						stamp: Date.now(),
						description,
						proof,
					}
				})
				.catch(err => {
					if (err === 'PROOF') {
						msg.reply(
							":bug: You didn't enter a valid proof link, so your vouch will be reverted."
						)
					} else {
						msg.reply(
							":no_entry: You didn't answer within the 20 seconds time frame, please try again."
						)
					}
					return Promise.resolve(null)
				})
		} else {
			// tell him he has to wait ... :fappa:
			msg.reply(
				":no_entry: You can't vouch for `" + user.tag + '`. You have to wait 12 Hours.'
			)
			return Promise.resolve(null)
		}
	})
}

const addVouch = (msg, user) => {
	msg.reply(
		'Thanks for vouching for ' +
			user.tag +
			', but we need further information. Please provide a description for your trade!'
	)
	return msg.channel
		.awaitMessages(m => m.author.id === msg.author.id, {
			max: 1,
			time: 20000,
			errors: ['time'],
		})
		.then(collected => {
			const description = collected.array()[0]
			msg.reply(
				'As last step I need a proof for your trade. This must be a link. Either a screenshot or a direct link to the trade itself.'
			)

			return msg.channel
				.awaitMessages(m => m.author.id === msg.author.id, {
					max: 1,
					time: 20000,
					errors: ['time'],
				})
				.then(collected => {
					return {
						description: description.cleanContent,
						proof: collected.array()[0].cleanContent,
					}
				})
				.catch(console.log)
		})
		.catch(console.log)
}

const checkIf12HoursAreOver = (vouches, id, authorId) => {
	const now = Date.now()
	const authorVouches = vouches[id]

	if (_.isArray(authorVouches)) {
		const lastVouchFromAuthor = authorVouches.find(vouch => vouch.user == authorId)
		// if there is an entry for you check the time diff
		if (_.isObject(lastVouchFromAuthor)) {
			const lastTime = moment.unix(lastVouchFromAuthor.time)
			return moment().diff(lastTime, 'seconds') >= 43200
		}
	}

	return true
}

const validURL = str => {
	const regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	return regexp.test(str)
}
