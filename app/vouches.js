import discord from 'discord.js'
import jsonfs from 'jsonfile'

import CONFIG from '../models/config'
import voteVouch from './voteVouch'
import vouchTopList from './voteTopList'
import vouchHelp from './vouchHelp'
import utils from './utils'
import Logger from './logger'

const client = new discord.Client()
const loggers = new Map()

let blocked = jsonfs.readFileSync(CONFIG.blockFile)
let vouches = jsonfs.readFileSync(CONFIG.vouchFile)

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
	CONFIG.guilds.forEach(guild => {
		const logger = registerLogger(guild)
		logger.log(
			'Connected',
			'VouchJS connected to your guild and will serve you with his magic!'
		)
	})
})

client.on('message', msg => {
	const workGuild = utils.getGuildInformation(msg.guild.id, CONFIG)
	if (!workGuild) {
		console.error(
			'Your guild is not registered. Please fill it into the config.js file!'
		)
		return
	}

	let logger = loggers.get(workGuild.guildId)
})

const handleMessage = (workGuild, logger, msg) => {
	if (workGuild && isValidMessageHandler(msg, workGuild)) {
		if (
			msg.cleanContent.includes(CONFIG.commands.vouch) &&
			msg.mentions.users.size === 1
		) {
			voteVouch(msg, blocked, vouches, client)
				.then(newVouches => {
					vouches = newVouches
					logger.log('new Vouch has been registered!', 'no details avialable.')
				})
				.catch(err => {
					logger.error(
						'Vouch failed hard',
						'This is a hard exception please inform kyon!'
					)
				})
		} else if (msg.cleanContent.includes(CONFIG.commands.vouchTopList)) {
			vouchTopList.showTopList(msg, vouches, client, VERSION)
		} else if (msg.cleanContent.includes(CONFIG.commands.vouchHelp)) {
			vouchHelp(client, CONFIG, msg)
		}
	}
}

const isValidMessageHandler = (msg, workGuild) =>
	msg.guild != null &&
	msg.channel.id == workGuild.vouchChannel &&
	msg.cleanContent.startsWith(CONFIG.executor)

const registerLogger = workGuild => {
	try {
		const channel = client.guilds
			.array()
			.find(guild => guild.id == workGuild.guildId)
			.channels.array()
			.find(channel => channel.id == workGuild.logChannel)
		const logger = new Logger(channel, client)
		loggers.set(workGuild.guildId, logger)
		return logger
	} catch (e) {
		console.log(e)
		console.error(
			'Either your guild is not active or wrong or you have an invalid channel select inside the config.js.'
		)
	}
}

client.login(CONFIG.discordToken)
