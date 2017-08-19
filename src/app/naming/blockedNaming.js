export default member => {
	return member.setNickname(blockMemberString(member))
}

const blockMemberString = member => {
	return `[B] ${member.user.username}`.slice(0, 32)
}
