import _ from 'underscore'
import utils from '../utils/utils'
import vouchesNaming from './vouchesNaming'
import blockedNaming from './blockedNaming'
import cleanNaming from './cleanNaming'
import kickNaming from './kickNaming'
import { remove, grant } from '../commands/roleGranter'

const namingRegexp = /\[[0-9]*.*(vp|b)\]/

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
			const workGuild = utils.getGuildInformation(guild.id, CONFIG)
			const logger = logging(guild.id)

			if (member == undefined) return

			if (workGuild && utils.countVouches(id, vouches) >= workGuild.marketAccess) {
				const role = guild.roles.array().find(r => r.id == workGuild.marketplaceRole)
				if (role) grant(member, role, logger)
			} else if (workGuild && utils.countVouches(id, vouches) < workGuild.marketAccess) {
				const role = guild.roles.array().find(r => r.id == workGuild.marketplaceRole)
				if (role && member.roles.array().find(r => r.id == role.id))
					remove(member, role, logger)
			}

			if (hasVouchInUsername(member)) {
				renaming.kick(member)
			} else if (utils.isUserBlocked(id, blocked)) {
				renaming.blocked(member).catch(() => {
					couldNotSetName(member, logger)
				})
			} else if (utils.hasVouches(id, vouches)) {
				renaming.vouched(member, vouches).catch(() => {
					couldNotSetName(member, logger)
				})
			} else if (hasVouchInNickname(member)) {
				renaming.clean(member).catch(() => {
					couldNotSetName(member, logger)
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
	if (!_.isUndefined(member) && member != null) {
		return namingRegexp.test(member.user.username.toLowerCase())
	} else {
		return false
	}
}

const hasVouchInNickname = member => {
	if (!_.isUndefined(member) && member != null && typeof member.nickname === 'string') {
		return namingRegexp.test(member.nickname.toLowerCase())
	} else return false
}
