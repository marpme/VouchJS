import discord from 'discord.js'

class Logger {
	constructor(channel, client) {
		if (!(channel instanceof discord.Channel)) {
			throw 'not a real channel!'
		}
		this.client = client
		this.channel = channel
		this.logStack = []
	}

	log(title, message) {
		console.log(message)
		this.channel.send({
			embed: createEmbed(title, message, 'LOG', this.client),
		})
		this.addTologStack(title, message, 'LOG')
	}

	warn(title, message) {
		console.log(message)
		this.channel.send({
			embed: createEmbed(title, message, 'WARN', this.client),
		})
		this.addTologStack(title, message, 'WARN')
	}

	error(title, message) {
		console.log(message)
		this.channel.send({
			embed: createEmbed(title, message, 'ERROR', this.client),
		})
		this.addTologStack(title, message, 'ERROR')
	}

	addTologStack(title, message, type) {
		this.logStack.unshift({ title, message, type })
		this.logStack = this.logStack.slice(0, 10)
	}
}

const createEmbed = (title, message, type, client) => ({
	color: 0xffffff,
	author: {
		name: client.user.username,
		icon_url: client.user.avatarURL,
	},
	title: 'Logging type: **' + type + '**',
	fields: [
		{
			name: title,
			value: message,
		},
	],
	timestamp: new Date(),
})

const createLogging = (client, CONFIG) => {
	const Loggers = new Map()
	const createLogger = workGuild => {
		try {
			const channel = client.guilds
				.array()
				.find(guild => guild.id == workGuild.guildId)
				.channels.array()
				.find(channel => channel.id == workGuild.logChannel)
			const logger = new Logger(channel, client)
			Loggers.set(workGuild.guildId, logger)
			return logger
		} catch (e) {
			console.log(e)
			console.error(
				'Either your guild is not active or you have an invalid channel select inside the config.js.'
			)
		}
	}

	CONFIG.guilds.forEach(guild => {
		const logger = createLogger(guild)
		logger.log(
			'Connected',
			'VouchJS connected to your guild and will serve you with his magic!'
		)
		logger.log(
			'**Guild Moderators:**\n',
			`${guild.moderators.map(id => `<@${id}>`).join('\n\n')}`
		)
	})

	return guildID => Loggers.get(guildID)
}

export default createLogging
