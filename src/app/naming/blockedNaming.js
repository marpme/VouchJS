export default member => {
	return member.setNickname(blockMemberString(member))
}

const blockMemberString = member => {
	return `[BLOCKED] ${member.user.username}`.slice(0, 32)
}
