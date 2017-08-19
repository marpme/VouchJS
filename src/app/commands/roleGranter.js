export const grant = (member, role, logger) => {
	if (member && role) {
		member
			.addRole(role)
			.then(() => {
				logger.log(
					`Granted trusted role!`,
					`User <@${member.user.id}> has been granted the role trusted seller!`
				)
			})
			.catch(() => {
				logger.err(
					`Couldn't grant trusted role!`,
					`Couldn't grant the role to user <@${member.user.id}>`
				)
			})
	}
}

export const remove = (member, role, logger) => {
	if (member && role) {
		member
			.removeRole(role)
			.then(() => {
				logger.log(
					`Granted trusted role!`,
					`User <@${member.user.id}> has been granted the role trusted seller!`
				)
			})
			.catch(() => {
				logger.err(
					`Couldn't grant trusted role!`,
					`Couldn't grant the role to user <@${member.user.id}>`
				)
			})
	}
}
