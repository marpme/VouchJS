export default (client, CONFIG, msg) => {
	msg.channel.send({
		embed: {
			color: 0xffffff,
			author: {
				name: client.user.username,
				icon_url: client.user.avatarURL,
			},
			title: 'How to use VouchJS in general',
			description: '_- short guide for VouchJS_',
			fields: [
				{
					name: '\u200B',
					value: '\u200B',
				},
				{
					name: `:information_source: USER SECTION`,
					value: '_all commands for a normal user_',
					inline: true,
				},
				{
					name: ':speech_balloon: Add a vouch for a user',
					value:
						'Write `' +
						CONFIG.executor +
						CONFIG.commands.base +
						' @username` and follow the procedure. \nYou`ll have a 12 hour cooldown for each user per vote.',
					inline: true,
				},
				{
					name: ':first_place: View the Top 10 traders',
					value:
						'Type `' +
						CONFIG.executor +
						CONFIG.commands.base +
						' ' +
						CONFIG.commands.vouchTopList +
						'` and you will receive a Top10 list of all traders.',
					inline: true,
				},
				{
					name: ':ballot_box_with_check: detailed vouch list for a single user',
					value:
						'Type `' +
						CONFIG.executor +
						CONFIG.commands.base +
						' ' +
						CONFIG.commands.vouchSingleList +
						' @username` and you will receive a list of vouches for this user.',
					inline: true,
				},
				{
					name: '\u200B',
					value: '\u200B',
				},
				{
					name: `:name_badge: ADMIN / MODERATOR SECTION`,
					value: '_all commands for Moderators and Admins_',
					inline: true,
				},
				{
					name: ':recycle: Remove a specific vouch from a user',
					value:
						'Type `' +
						CONFIG.executor +
						CONFIG.commands.base +
						' ' +
						CONFIG.commands.vouchRemove +
						' @username` and you will be able to remove a vouch in a short dialog.',
					inline: true,
				},
				{
					name: ':x: Reset vouches from a user',
					value:
						'Type `' +
						CONFIG.executor +
						CONFIG.commands.base +
						' ' +
						CONFIG.commands.vouchReset +
						' @username` and it will remove every single vouch from a user!',
					inline: true,
				},
				{
					name: ':negative_squared_cross_mark: Blocks a user from creating new vouches',
					value:
						'Type `' +
						CONFIG.executor +
						CONFIG.commands.base +
						' ' +
						CONFIG.commands.vouchBlock +
						' @username` and it will block the user until he`s getting unblocked',
					inline: true,
				},
				{
					name: ':white_check_mark: Unblocks a user from creating new vouches',
					value:
						'Type `' +
						CONFIG.executor +
						CONFIG.commands.base +
						' ' +
						CONFIG.commands.vouchUnblock +
						' @username` and it will unblock the user.',
					inline: true,
				},
			],
			timestamp: new Date(),
			footer: {
				text: '© VouchJS (' + CONFIG.version + ')',
			},
		},
	})
}
