const discord = require('discord.js')
const jsonfs = require('jsonfile')
const client = new discord.Client()

const allowedGuilds = ['330811417467027456']
const isIncludedGuild = ID => allowedGuilds.includes(ID)
const isAdmin = authorID =>
	'158195841335558144' === authorID
const isBot = ID => '343713770406936576' === ID

const vouchesFile = './models/vouches.json'
const blockFile = './models/blocked.json'
const token = ''
const VERSION = '0.2.1b'

// functionalities
const voteVouch = require('./voteVouch')
const vouchTopList = require('./voteTopList')

let blocked = jsonfs.readFileSync(blockFile)
let vouches = jsonfs.readFileSync(vouchesFile)

console.log('--- Vouches table ---')
console.log(vouches)
console.log('---------------------')
console.log('\n')
console.log('--- Blocked table ---')
console.log(blocked)
console.log('---------------------')

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
	setInterval(() => {
		client.sweepMessages(60)
	}, 60000)
})

client.on('message', msg => {
	if (
		msg.guild != null &&
		isIncludedGuild(msg.guild.id) &&
		!isBot(msg.author.id) &&
		msg.channel.id === '330816857034457088' &&
		msg.cleanContent.startsWith('!')
	) {
		if (
			msg.cleanContent.includes('vouch') &&
			msg.mentions.users.size === 1
		) {
			voteVouch
				.vote(msg, blocked, vouches, client)
				.then(newVouches => (vouches = newVouches))
				.catch(err => {
					console.log('A Vouch failed hard!')
				})
		} else if (msg.cleanContent.includes('vouch top')) {
			vouchTopList.showTopList(
				msg,
				vouches,
				client,
				VERSION
			)
		} else if (msg.cleanContent.includes('vouch')) {
			msg.channel.send({
				embed: {
					color: 0xffffff,
					author: {
						name: client.user.username,
						icon_url: client.user.avatarURL
					},
					title: 'How to use VouchJS in general',
					description:
						'_- short guide for VouchJS_',
					fields: [
						{
							name: 'Add a vouch for a user',
							value:
								'Write `!vouch @username` and follow the procedure. \nYou`ll have a 12 hour cooldown for each user per vote.'
						},
						{
							name:
								'View the **TOP10** traders',
							value:
								'Type `!vouch top` and you will receive a Top10 list of all traders.'
						}
					],
					timestamp: new Date(),
					footer: {
						text: '© VouchJS (' + VERSION + ')'
					}
				}
			})
		}
	}
})

client.login(token)
