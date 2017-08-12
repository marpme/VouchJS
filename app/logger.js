import discord from 'discord.js'
import utils from './utils'
import CONFIG from '../models/config'

export default class Logger {
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
