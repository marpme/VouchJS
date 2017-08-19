import Discord from 'discord.js'

class Logger {
	constructor(channel, client) {
		if (!(channel instanceof Discord.Channel)) {
			throw 'not a real channel!'
		}
		this.client = client
		this.channel = channel
		this.logStack = []
	}

	vouchLog(fields) {
		const embed = createEmbeddedWithoutFields(':ballot_box_with_check:')
		fields.forEach(({ title, message }) => embed.addField(title, message, true))
		return this.channel.send({
			embed,
		})
	}

	log(title, message) {
		console.log(message)
		this.addTologStack(title, message, ':ballot_box_with_check:')
		return this.channel.send({
			embed: createEmbed(title, message, ':ballot_box_with_check:', this.client),
		})
	}

	warn(title, message) {
		console.log(message)
		this.addTologStack(title, message, ':warning:')
		return this.channel.send({
			embed: createEmbed(title, message, ':warning:', this.client),
		})
	}

	error(title, message) {
		console.log(message)
		this.addTologStack(title, message, ':no_entry:')
		return this.channel.send({
			embed: createEmbed(title, message, ':no_entry:', this.client),
		})
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
	title: `${type} logging`,
	fields: [
		{
			name: title,
			value: message,
		},
	],
	timestamp: new Date(),
})

const createEmbeddedWithoutFields = type => {
	return new Discord.RichEmbed()
		.setTitle(`${type} logging`)
		.setAuthor('VouchJS')
		.setColor(0xffffff)
		.setTimestamp()
}

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
