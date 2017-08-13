import utils from '../utils/utils'

/**
 * Vouched renaming
 */
export default (member, vouches) => {
	const vouchCount = utils.countVouches(member.user.id, vouches)
	return member.setNickname(vouchCountString(member, vouchCount))
}

const vouchCountString = (member, vouchCount) => {
	return vouchCount > 1
		? `[${vouchCount} Vouches] ${member.user.username}`.slice(0, 32)
		: `[${vouchCount} Vouch] ${member.user.username}`.slice(0, 32)
}
