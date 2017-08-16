export default member => {
	return member.setNickname(cleanMemberString(member))
}

const cleanMemberString = member => {
	return `${member.user.username}`
}
