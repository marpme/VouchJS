import _ from 'underscore'
import utils from './utils'

export default (client, vouches, blocked, CONFIG) => {
  const guilds = client.guilds
    .array()
    .map(
      guild => (utils.getGuildInformation(guild.id, CONFIG) ? guild : undefined)
    )
    .filter(guild => !_.isUndefined(guild))

  const updateUsername = vouches => {
    const vouchUserIds = Object.keys(vouches)

    vouchUserIds.forEach(id => {
      guilds.forEach(guild => {
        const member = guild.members.get(id)
        if (!_.isUndefined(member.user)) {
          member
            .setNickname(
              `[${vouchCountString(id, vouches)}] ${member.user.username}`
            )
            .catch(err => console.log('Naming Handler: ' + err))
        }
      })
    })
  }

  updateUsername(vouches)
  return updateUsername
}

const vouchCountString = (id, vouches) => {
  const count = utils.countVouches(id, vouches)
  return count > 1 ? `${count} Vouches` : `${count} Vouch`
}
