import _ from 'underscore'
import utils from './utils'

export default (client, vouches, blocked, CONFIG) => {
  const vouchUserIds = Object.keys(vouches)

  const guilds = client.guilds
    .array()
    .map(
      guild => (utils.getGuildInformation(guild.id, CONFIG) ? guild : undefined)
    )
    .filter(guild => !_.isUndefined(guild))

  vouchUserIds.forEach(id => {
    guilds.forEach(guild => {
      const member = guild.members.get(id)
      if (!_.isUndefined(member.user)) {
        member
          .setNickname(
            `[${utils.countVouches(id, vouches)} VP] ${member.user.username}`
          )
          .catch(err => console.log('Naming Handler: ' + err))
      }
    })
  })

  const updateUsername = userID => {}

  return updateUsername
}
