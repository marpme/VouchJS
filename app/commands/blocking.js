import utils from '../utils/utils'

const block = (msg, blocked, vouches, workingGuild, updateUsername) => {
	if (!utils.isModerator(msg.author.id, workingGuild)) return

	const toBeBlocked = msg.mentions.members.array()

	return Promise.resolve(
		toBeBlocked.reduce((newBlocked, currentUser) => {
			const addedBlock = {
				...newBlocked,
				[currentUser.id]: 1,
			}
			updateUsername(currentUser.id, vouches, addedBlock)
			return addedBlock
		}, blocked)
	)
}

const unblock = (msg, blocked, vouches, workingGuild, updateUsername) => {
	if (!utils.isModerator(msg.author.id, workingGuild) || msg.mentions.users.size > 100) return

	const toBeUnblocked = msg.mentions.users.array().filter(user => user != null)

	return Promise.resolve(
		toBeUnblocked.reduce((newBlocked, currentUser) => {
			const removeBlocked = {
				...newBlocked,
				[currentUser.id]: 0,
			}
			updateUsername(currentUser.id, vouches, removeBlocked)
			return removeBlocked
		}, blocked)
	)
}

export { block, unblock }
