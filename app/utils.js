const utils = {
	getGuildInformation: (id, CONFIG) =>
		CONFIG.guilds.find(guild => guild.guildId == id),

	isAdmin: authorID => CONFIG.admins.includes(authorID),
}

export default utils
