const discord = require('discord.js')
const jsonfs = require('jsonfile')
const client = new discord.Client()

const allowedGuilds = [ "330811417467027456" ]
const isIncludedGuild = (ID) => allowedGuilds.includes(ID)
const isAdmin = (authorID) => "158195841335558144" === authorID
const isBot = (ID) => "343713770406936576"=== ID

const vouchesFile = "./models/vouches.json"
const blockFile = "./models/blocked.json"
const token = "MzQzNzEzNzcwNDA2OTM2NTc2.DGiL6Q.U-h4j1cbEL_1O2I7ueQ4K_eb730"

// functionalities
const voteVouch = require('./voteVouch')

let blocked = jsonfs.readFileSync(blockFile)
let vouches = jsonfs.readFileSync(vouchesFile)

console.log("--- Vouches table ---")
console.log(vouches)
console.log("---------------------")
console.log("\n")
console.log("--- Blocked table ---")
console.log(blocked)
console.log("---------------------")

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if(msg.guild != null && isIncludedGuild(msg.guild.id) && !isBot(msg.author.id) && 
    msg.channel.id === "330816857034457088" && msg.cleanContent.startsWith("!")) {

    if(msg.cleanContent.includes("vouch") 
      && msg.mentions.users.size === 1){

        voteVouch.vote(msg, blocked, vouches, client)
        .then(newVouches => vouches = newVouches)
        .catch((err) => { 
          console.log("A Vouch failed hard!") 
        })

    }else if(msg.cleanContent.includes("vouch")){
      msg.reply(":information_source: Usage: `!vouch` `@username`")
    }

  }
});

client.login(token);

