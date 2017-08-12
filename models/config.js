export default {
  discordToken: '',
  guilds: [
    {
      guildId: '330811417467027456',
      vouchChannel: '330816857034457088',
      logChannel: '344442214946177024',
      moderators: ['158195841335558144', '315830515951206402'],
      marketplace: ['000000'],
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
    vouchSingleList: 'list',
  },
  executor: '.',
  version: '0.3.5b',
}
