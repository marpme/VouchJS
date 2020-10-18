export default {
	discordToken: 'NzY3MzcwNzk3NDQxNzQ0OTY2.X4w7vw.y-ucuDGH1msq1NBuoNfuWk6NjPg',
	guilds: [
		{
			guildId: '739549145240436796',
			vouchChannel: '766051186872418314',
			logChannel: '766051186872418314',
			moderators: ['753743713892565125'],
			marketplaceRole: '765947681901248513',
			marketAccess: 3, // count of minimum vouches >=
			marketTimeout: 12, // waiting time in hours per message
		},
	],
	botID: '767370797441744966',
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
