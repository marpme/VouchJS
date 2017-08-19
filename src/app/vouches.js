import discord from 'discord.js'
import admin from 'firebase-admin'

import CONFIG from '../models/config'
import FIREBASE_CONFIG from '../models/vouching-firebase'

import voteVouch from './commands/voteVouch'
import vouchTopList from './commands/voteTopList'
import vouchHelp from './commands/vouchHelp'
import vouchSingleList from './commands/vouchSingleList'
import { block, unblock } from './commands/blocking'
import reset from './commands/reset'
import remove, { removeVouches } from './commands/remove'

import utils from './utils/utils'
import createLogging from './utils/logger'
import namingHandler from './naming/index'
// import messageHandling from './commands/messageHandling'
import _ from 'underscore'

const firebase = admin.initializeApp({
	credential: admin.credential.cert(FIREBASE_CONFIG),
	databaseURL: 'https://vouching-dad0d.firebaseio.com',
})

const database = firebase.database()
const client = new discord.Client()

let logging
let vouchingData
let updateNaming

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
	logging = createLogging(client, CONFIG, new Map())
	updateNaming = namingHandler(client, logging, CONFIG)
	client.guilds.forEach(guild => {
		const members = guild.members.array()
		members.forEach(member => {
			updateNaming(member.user.id, vouchingData.vouches, vouchingData.blocked)
		})
	})
})

client.on('message', msg => {
	if (_.isUndefined(msg.guild) || msg.guild == null || msg.author.id == client.user.id) return

	const workGuild = utils.getGuildInformation(msg.guild.id, CONFIG)
	if (!workGuild) {
		console.error('Your guild is not registered. Please fill it into the config.js file!')
		return
	}

	// messageHandling(msg, vouchingData.vouches, vouchingData.blocked, workGuild)
	// updateNaming(msg.author.id, vouchingData.vouches, vouchingData.blocked)
	handleMessage(workGuild, logging(workGuild.guildId), msg)
})

const handleMessage = (workGuild, logger, msg) => {
	if (
		workGuild &&
		utils.isValidMessageHandler(msg, workGuild, CONFIG) &&
		msg.cleanContent.startsWith(CONFIG.executor + CONFIG.commands.base)
	) {
		if (msg.cleanContent.includes(CONFIG.commands.vouchTopList)) {
			vouchTopList(msg, vouchingData.vouches, client, CONFIG)
		} else if (msg.cleanContent.includes(CONFIG.commands.vouchHelp)) {
			vouchHelp(client, CONFIG, msg)
		} else if (
			msg.cleanContent.includes(CONFIG.commands.vouchSingleList) &&
			msg.mentions.users.size === 1
		) {
			vouchSingleList(msg, logger, vouchingData.blocked, vouchingData.vouches, CONFIG)
		} else if (
			msg.cleanContent.includes(CONFIG.commands.vouchUnblock) &&
			msg.mentions.users.size >= 1
		) {
			unblock(
				msg,
				vouchingData.blocked,
				vouchingData.vouches,
				workGuild,
				updateNaming
			).then(newBlocked => {
				database.ref('blocked').set(newBlocked)
			})
		} else if (
			msg.cleanContent.includes(CONFIG.commands.vouchBlock) &&
			msg.mentions.users.size >= 1
		) {
			block(
				msg,
				vouchingData.blocked,
				vouchingData.vouches,
				workGuild,
				updateNaming
			).then(newBlocked => {
				database.ref('blocked').set(newBlocked)
			})
		} else if (
			msg.cleanContent.includes(CONFIG.commands.vouchReset) &&
			msg.mentions.users.size == 1
		) {
			reset(msg, vouchingData.vouches, workGuild).then(newVouches => {
				database.ref('vouches').set(newVouches)
				updateNaming(msg.mentions.users.array()[0].id, newVouches, vouchingData.blocked)
			})
		} else if (
			msg.cleanContent.includes(CONFIG.commands.vouchRemove) &&
			msg.mentions.users.size == 1
		) {
			remove(
				msg,
				logger,
				vouchingData.vouches,
				vouchingData.blocked,
				workGuild,
				vouchSingleList,
				CONFIG
			).then(newVouches => {
				database.ref('vouches').set(newVouches)
				updateNaming(msg.mentions.users.array()[0].id, newVouches, vouchingData.blocked)
			})
		} else if (msg.mentions.users.size === 1) {
			voteVouch(
				msg,
				vouchingData.blocked,
				vouchingData.vouches,
				client,
				logger,
				updateNaming,
				CONFIG,
				workGuild,
				removeVouches,
				database
			)
				.then(newVouches => {
					database.ref('vouches').set(newVouches)
				})
				.catch(() => {
					logger.error(
						'Vouch failed hard',
						'This is a hard exception please inform kyon!'
					)
				})
		} else {
			vouchHelp(client, CONFIG, msg)
		}
	}
}

client.on('guildMemberAdd', newMember => {
	updateNaming(newMember.user.id, vouchingData.vouches, vouchingData.blocked)
})

client.on('guildMemberUpdate', (oldMember, newMember) => {
	updateNaming(newMember.user.id, vouchingData.vouches, vouchingData.blocked)
})

database
	.ref('/')
	.once('value')
	.then(snapshot => {
		vouchingData = snapshot.val()

		database.ref('/vouches').on('value', snapshot => {
			vouchingData.vouches = snapshot.val()
		})

		database.ref('/blocked').on('value', snapshot => {
			vouchingData.blocked = snapshot.val()
		})

		client.login(CONFIG.discordToken)
	})
	.catch(errorObject => {
		console.error(
			'The read failed: ' +
				errorObject.code +
				`. We could connect to our database. Please retry and check your settings`
		)
	})
