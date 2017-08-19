import utils from '../utils/utils'

/**
 * Vouched renaming
 */
export default (member, vouches) => {
	const vouchCount = utils.countVouches(member.user.id, vouches)
	return member.setNickname(vouchCountString(member, vouchCount))
}

const vouchCountString = (member, vouchCount) =>
	`[${vouchCount}VP] ${member.user.username}`.slice(0, 32)
