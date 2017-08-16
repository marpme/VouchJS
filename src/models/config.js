export default {
	discordToken: '',
	guilds: [
		{
			guildId: '330811417467027456',
			vouchChannel: '346005544336752640',
			logChannel: '344442214946177024',
			moderators: ['158195841335558144'],
			marketplace: '332582797493534720',
			marketAccess: 5, // count of minimum vouches >=
			marketTimeout: 12, // waiting time in hours per message
		},
	],
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
	},
	executor: '.',
	version: '0.3.5b',
}
