import _ from 'underscore'
export default (msg, vouches) => {
	return new Promise(resolve => {
		const { [msg.author.id]: remove, ...rest } = vouches
		return resolve(rest)
	})
}
