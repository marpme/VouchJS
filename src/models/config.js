export default {
	discordToken: '',
	guilds: [
		{
			guildId: '330811417467027456',
			vouchChannel: '347474370752413698',
			logChannel: '344442214946177024',
			moderators: ['158195841335558144', '98468186311106560'],
			marketplace: '347473396935950337',
			marketAccess: 5, // count of minimum vouches >=
			marketTimeout: 12, // waiting time in hours per message
		},
	],
	botID: '347455479028514816',
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
