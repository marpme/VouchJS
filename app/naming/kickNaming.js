export default (member, loggers) => {
	return member
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
			loggers(member.guild.id).log(
				'Kicked member due to invalid naming',
				`kicked member <@${member.user.id}>`
			)
		})
		.catch(() => {
			loggers(member.guild.id).warn(
				'Couldn`t kick user',
				`Couldn't kick <@${member.user.id}>`
			)
		})
}
