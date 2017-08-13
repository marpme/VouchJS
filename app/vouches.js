import discord from 'discord.js'
import jsonfs from 'jsonfile'
import admin from 'firebase-admin'

import CONFIG from '../models/config'
import FIREBASE_CONFIG from '../models/vouching-firebase'
import voteVouch from './voteVouch'
import vouchTopList from './voteTopList'
import vouchHelp from './vouchHelp'
import vouchSingleList from './vouchSingleList'
import utils from './utils'
import Logger from './logger'
import namingHandler from './namingHandler'
import _ from 'underscore'

const firebase = admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_CONFIG),
  databaseURL: 'https://vouching-dad0d.firebaseio.com',
})

const database = firebase.database()
const client = new discord.Client()
const loggers = new Map()
let vouchingData
let updateUsername

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  CONFIG.guilds.forEach(guild => {
    const logger = registerLogger(guild)
    logger.log(
      'Connected',
      'VouchJS connected to your guild and will serve you with his magic!'
    )
  })

  updateUsername = namingHandler(
    client,
    vouchingData.vouches,
    vouchingData.blocked,
    CONFIG,
    loggers
  )
})

client.on('message', msg => {
  if (_.isUndefined(msg.guild) || msg.guild == null) return

  const workGuild = utils.getGuildInformation(msg.guild.id, CONFIG)
  if (!workGuild) {
    console.error(
      'Your guild is not registered. Please fill it into the config.js file!'
    )
    return
  }

  let logger = loggers.get(workGuild.guildId)
  handleMessage(workGuild, logger, msg)
})

const handleMessage = (workGuild, logger, msg) => {
  if (
    workGuild &&
    isValidMessageHandler(msg, workGuild) &&
    msg.cleanContent.startsWith(CONFIG.executor + CONFIG.commands.base)
  ) {
    if (msg.cleanContent.includes(CONFIG.commands.vouchTopList)) {
      vouchTopList.showTopList(msg, vouchingData.vouches, client, CONFIG)
    } else if (msg.cleanContent.includes(CONFIG.commands.vouchHelp)) {
      vouchHelp(client, CONFIG, msg)
    } else if (
      msg.cleanContent.includes(CONFIG.commands.vouchSingleList) &&
      msg.mentions.users.size === 1
    ) {
      vouchSingleList(
        msg,
        logger,
        vouchingData.blocked,
        vouchingData.vouches,
        CONFIG
      )
    } else if (msg.mentions.users.size === 1) {
      voteVouch(msg, vouchingData.blocked, vouchingData.vouches, client, logger)
        .then(newVouches => {
          database.ref('vouches').set(newVouches)
        })
        .catch(err => {
          logger.error(
            'Vouch failed hard',
            'This is a hard exception please inform kyon!'
          )
        })
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
      'Either your guild is not active or you have an invalid channel select inside the config.js.'
    )
  }
}

database
  .ref('/')
  .once('value')
  .then(snapshot => {
    vouchingData = snapshot.val()
    database.ref('/vouches').on('value', snapshot => {
      vouchingData.vouches = snapshot.val()
      if (updateUsername instanceof Function)
        updateUsername(vouchingData.vouches)
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
