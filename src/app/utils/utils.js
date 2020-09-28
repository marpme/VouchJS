import _ from 'underscore'

const utils = {
	getGuildInformation: (id, CONFIG) => CONFIG.guilds.find(guild => guild.guildId == id),

	isWorkingGuild: (id, CONFIG) => !!CONFIG.guilds.find(guild => guild.guildId == id),

	isModerator: (authorID, workingGuild) => workingGuild.moderators.includes(authorID),

	findGuildMember: (id, msg) => {
		const user = msg.guild.members.map(member => member.user).find(user => user.id === id)
		return user != null ? user.tag : 'User not longer in Guild'
	},

	isGuildMemberStillThere: (id, msg) => msg.guild.members.get(id) != undefined,

	isUserBlocked: (userid, blockedList) =>
		blockedList && _.isNumber(blockedList[userid]) && blockedList[userid] === 1,

	hasVouches: (userId, vouchList) => vouchList && _.isArray(vouchList[userId]) && vouchList[userId].length > 0,

	countVouches: (userId, vouchList) =>
		vouchList && _.isArray(vouchList[userId]) ? vouchList[userId].length : 0,

	isValidMessageHandler: (msg, workGuild, CONFIG) =>
		msg.guild != null &&
		msg.channel.id == workGuild.vouchChannel &&
		msg.cleanContent.startsWith(CONFIG.executor),
}

export default utils
