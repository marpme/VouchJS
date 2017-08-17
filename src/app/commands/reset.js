import _ from 'underscore'
import utils from '../utils/utils'
export default (msg, vouches, workingGuild) => {
	return new Promise(resolve => {
		if (utils.isModerator(msg.author.id, workingGuild)) {
			const { [msg.mentions.users.array()[0].id]: remove, ...rest } = vouches
			return resolve(rest)
		}

		return resolve(vouches)
	})
}
