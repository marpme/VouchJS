import _ from 'underscore'

const utils = {
	getGuildInformation: (id, CONFIG) =>
		CONFIG.guilds.find(guild => guild.guildId == id),

	isAdmin: authorID => CONFIG.admins.includes(authorID),

	findGuildMember: (id, msg) => {
		const user = msg.guild.members
			.map(member => member.user)
			.find(user => user.id === id)
		return user != null ? user.tag : 'User not longer in Guild'
	},

	isUserBlocked: (userid, blockedList) =>
		_.isString(blockedList[userid]) && blockedList[userid] == '1',

	hasVouches: (userId, vouchList) =>
		_.isArray(vouchList[userId]) && vouchList[userId].length > 0,
}

export default utils
