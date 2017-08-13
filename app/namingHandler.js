import _ from 'underscore'
import utils from './utils'

export default (client, vouches, blocked, CONFIG, loggers) => {
  const guilds = client.guilds
    .array()
    .map(
      guild => (utils.getGuildInformation(guild.id, CONFIG) ? guild : undefined)
    )
    .filter(guild => !_.isUndefined(guild))

  const NickNamesPromises = guilds.map(guild => {
    return guild.members.array().map(member => {
      const userVouches = vouches[member.user.id]
      if (
        _.isUndefined(userVouches) &&
        hasVouchInNickname(client, member, loggers)
      ) {
        return member.setNickname(member.user.username).catch(() => {
          loggers
            .get(guild.id)
            .log(
              'Couldn`t set nickname',
              `Couldn't set the nickname for <@${member.user.id}>`
            )
        })
      }

      hasVouchInUsername(client, member, loggers)
    })
  })

  const updateUsername = vouches => {
    const vouchUserIds = Object.keys(vouches)

    vouchUserIds.forEach(id => {
      guilds.forEach(guild => {
        const member = guild.members.get(id)
        if (
          !_.isUndefined(member.user) &&
          !hasVouchInUsername(client, member, loggers)
        ) {
          member
            .setNickname(vouchCountString(id, vouches, member))
            .catch(() =>
              loggers
                .get(guild.id)
                .log(
                  'Couldn`t set nickname',
                  `Couldn't set the nickname for <@${id}>`
                )
            )
        }
      })
    })
  }

  client.on('guildMemberAdd', member => {
    const id = member.user.id
    guilds.forEach(guild => {
      const member = guild.members.get(id)
      if (
        !_.isUndefined(member.user) &&
        !hasVouchInUsername(client, member, loggers) &&
        utils.countVouches(id, vouches) > 0
      ) {
        member
          .setNickname(vouchCountString(id, vouches, member))
          .catch(() =>
            loggers
              .get(guild.id)
              .log(
                'Couldn`t set nickname',
                `Couldn't set the nickname for <@${id}>`
              )
          )
      }
    })
  })

  client.on('guildMemberUpdate', (oldMember, newMember) => {
    const id = newMember.user.id
    guilds.forEach(guild => {
      const member = guild.members.get(id)
      if (
        !_.isUndefined(member.user) &&
        !hasVouchInUsername(client, member, loggers) &&
        utils.countVouches(id, vouches) > 0
      ) {
        member
          .setNickname(vouchCountString(id, vouches, member))
          .catch(err =>
            loggers
              .get(guild.id)
              .log(
                'Couldn`t set nickname',
                `Couldn't set the nickname for <@${id}>`
              )
          )
      }
    })
  })

  Promise.all(NickNamesPromises).then(() => {
    updateUsername(vouches)
  })

  return updateUsername
}

const hasVouchInUsername = (client, member, loggers) => {
  const regexp = /\[[0-9]*[\s]*(Vouches|Vouch)\]/
  if (regexp.test(member.user.username)) {
    reportInvalidUsername(member, loggers)
    return true
  }

  return false
}

const hasVouchInNickname = (client, member) => {
  const regexp = /\[[0-9]*[\s]*(Vouches|Vouch)\]/
  return regexp.test(member.nickname)
}

const vouchCountString = (id, vouches, member) => {
  const count = utils.countVouches(id, vouches)
  return count > 1
    ? `[${count} Vouches] ${member.user.username}`.slice(0, 32)
    : `[${count} Vouch] ${member.user.username}`.slice(0, 32)
}

const reportInvalidUsername = (member, loggers) => {
  member
    .createDM()
    .then(channel => {
      member.guild.defaultChannel.createInvite({ maxUses: 1 }).then(invite => {
        return channel.send(
          `You have \`[...vouch]\` in your name, please remove that and rejoin the guild.\n ${invite}`
        )
      })
    })
    .then(() => {
      return member.kick()
    })
    .then(() => {
      loggers
        .get(member.guild.id)
        .log(
          'Kicked member due to invalid naming',
          `kicked member <@${member.user.id}>`
        )
    })
    .catch(() => {
      loggers
        .get(member.guild.id)
        .log('Couldn`t kick user', `Couldn't kick <@${member.user.id}>`)
    })
}
