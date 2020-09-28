export default {
	discordToken: '',
	guilds: [
		{
			guildId: '760214655120965664',
			vouchChannel: '760214739489128498',
			logChannel: '760214824679768105',
			moderators: ['169887202493333505'],
			marketplaceRole: '760214956632703036',
			marketAccess: 3, // count of minimum vouches >=
			marketTimeout: 12, // waiting time in hours per message
		},
	],
	botID: '411966694433751041',
	blockFile: './models/blocked.json',
	vouchFile: './models/vouches.json',
	commands: {
		// renaming commands
		base: 'vouch',
		vouchHelp: 'help',
		vouchTopList: 'top',
		vouchBlock: 'block',
		vouchUnblock: 'unblock',
		vouchSingleList: 'list',
		vouchReset: 'reset',
		vouchRemove: 'remove',
	},
	executor: '!',
	version: '0.4.0b',
}
