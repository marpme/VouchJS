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
					name: 'Add a vouch for a user',
					value:
						'Write `' +
						CONFIG.executor +
						CONFIG.commands.vouch +
						' @username` and follow the procedure. \nYou`ll have a 12 hour cooldown for each user per vote.',
				},
				{
					name: 'View the **TOP10** traders',
					value:
						'Type `' +
						CONFIG.executor +
						CONFIG.commands.vouchTopList +
						'` and you will receive a Top10 list of all traders.',
				},
			],
			timestamp: new Date(),
			footer: {
				text: '© VouchJS (' + CONFIG.version + ')',
			},
		},
	})
}
