import Discord from 'discord.js'
import moment from 'moment'
import utils from './utils'

exports.showTopList = (msg, vouches, client, CONFIG) => {
  const embed = new Discord.RichEmbed()
    .setTitle('Traders - TOP 10 list')
    .setAuthor('VouchJS', client.user.avatarURL)
    .setColor(0xffffff)
    .setFooter('© VouchJS (' + CONFIG.version + ')', client.user.avatarURL)
    .setThumbnail(client.user.avatarURL)
    .setTimestamp()

  const userVouchesMap = Object.keys(vouches)
    .map(key => ({
      key,
      count: vouches[key].length,
      lastInsert: vouches[key][0],
    }))
    .sort((prev, next) => next.count - prev.count)
    .slice(0, 10)

  userVouchesMap.forEach((vouch, index) => {
    embed.addField(
      index + 1 + `. ${utils.findGuildMember(vouch.key)}`,
      'with **' +
        vouch.count +
        ' vouches** | Last Trade with ' +
        `<@${vouch.lastInsert.user}>` +
        ' at ' +
        moment.unix(vouch.lastInsert.time).format('DD-MM-YYYY h:mm:ss a')
    )
  })

  msg.channel.send({ embed })
}
