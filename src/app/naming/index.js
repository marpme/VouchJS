import _ from 'underscore'
import utils from '../utils/utils'
import vouchesNaming from './vouchesNaming'
import blockedNaming from './blockedNaming'
import cleanNaming from './cleanNaming'
import kickNaming from './kickNaming'

const namingRegexp = /\[[0-9]*.*(vouches|vouch|blocked)\]/

export default (client, logging, CONFIG) => {
	const allGuilds = client.guilds.array().filter(guild => utils.isWorkingGuild(guild.id, CONFIG))

	const renaming = {
		vouched: (member, vouches) => vouchesNaming(member, vouches),
		blocked: member => blockedNaming(member),
		clean: member => cleanNaming(member),
		kick: member => kickNaming(member, logging),
	}

	const updateNaming = (id, vouches, blocked) => {
		allGuilds.forEach(guild => {
			const member = guild.members.get(id)

			if (hasVouchInUsername(member)) {
				renaming.kick(member)
			} else if (utils.isUserBlocked(id, blocked)) {
				renaming.blocked(member).catch(() => {
					couldNotSetName(member, logging(guild.id))
				})
			} else if (utils.hasVouches(id, vouches)) {
				renaming.vouched(member, vouches).catch(() => {
					couldNotSetName(member, logging(guild.id))
				})
			} else if (hasVouchInNickname(member)) {
				renaming.clean(member).catch(() => {
					couldNotSetName(member, logging(guild.id))
				})
			}
		})
	}

	return updateNaming
}

const couldNotSetName = (member, logger) => {
	logger.warn(
		'Could not set Name!',
		`I couldn't set the name for the following user <@${member.user.id}>`
	)
}

const hasVouchInUsername = member => {
	if (!_.isUndefined(member)) {
		return namingRegexp.test(member.user.username.toLowerCase())
	} else {
		return false
	}
}

const hasVouchInNickname = member => {
	if (_.isUndefined(member) && typeof member.nickname === 'string') {
		return namingRegexp.test(member.nickname.toLowerCase())
	} else return false
}
