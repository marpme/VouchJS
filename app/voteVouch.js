exports.vote = (msg, blocked, vouches, client) => {
    let users = msg.mentions.users.array()
    
    let description;
    let proof;

    // check if the user wants to vouch himself
    if(users.find((user) => user.id === msg.author.id) != undefined){
        msg.reply(":no_entry: You can't vouch yourself, but nice try.")
        return vouches
     // check if the voucher is blocker RIP
    } else if (blocked[msg.author.id] != null){
        msg.reply(":no_entry: You can't vouch anymore, you have been blocked.")
        return vouches
    }


    let uniqueMetion = [...new Set(users)]; 

    return Promise.all(createVouchRequestForUsers(uniqueMetion, msg, vouches)).then(createdVouches => {

        const newVouches = createdVouches.reduce((prev, vouch) => {
            if (vouch == null) 
                return vouches;

            let { user, authorID, stamp, description, proof } = vouch
            if(prev[user.id] === undefined){
                prev[user.id] = [{ [authorID]: stamp, description, proof }];
            } else {
                prev[user.id].unshift({ [authorID]: stamp, description, proof });
            }
            return prev;
        }, vouches);

        return newVouches
    })

    
}

const createVouchRequestForUsers = (metionedUsers, msg, vouches) => {
    return metionedUsers.map(user => {
        // scrap through all vouches 
        // check if we vote in last 12h for this user
        if(checkIf12HoursAreOver(vouches, user.id, msg.author.id)){
            return addVouch(msg, user).then(({ description, proof }) => {
                if(!validURL(proof)) throw "PROOF";

                msg.reply(":white_check_mark: You've added " + user.tag + " a vouch. He gets notified aswell!")
                return { user, authorID: msg.author.id, stamp: Date.now(), description, proof }
            }).catch(err => {
                if(err === "PROOF"){
                    msg.reply(":bug: You didn't enter a valid proof link, so your vouch will be reverted.")
                }else{
                    msg.reply(":no_entry: You didn't answer within the 20 seconds time frame, please try again.")
                }
                return Promise.resolve(null);
            });
        } else {
            // tell him he has to wait ... :fappa:
            msg.reply(":no_entry: You can't vouch for `" + user.tag + "`. You have to wait 12 Hours.")
            return Promise.resolve(null);
        }
    })
}

const addVouch = (msg, user) => {
    msg.reply("Thanks for vouching for " + user.tag + ", but we need further information. Please provide a description for your trade!");
    return msg.channel.awaitMessages(
        (m) => (m.author.id === msg.author.id), 
        { max: 1, time: 20000, errors: ['time'] }
    ).then(collected => {
        const description = collected.array()[0]
        msg.reply("As last step I need a proof for your trade. This must be a link. Either a screenshot or a direct link to the trade itself.");
    
        return msg.channel.awaitMessages(
            (m) => (m.author.id === msg.author.id), 
            { max: 1, time: 20000, errors: ['time'] }
        ).then(collected => {
            return { description: description.cleanContent, proof: collected.array()[0].cleanContent}
        }).catch(console.log)
    }).catch(console.log)
 
}

const checkIf12HoursAreOver = (vouches, id, authorId) => {
    const now = Date.now() 
    const last = vouches[id]

    if(last == undefined) return true

    const lastVouch = last.find(vouch => vouch[authorId] !== undefined)
    // if there is an entry for you check the time diff
    if(lastVouch != undefined){
        return ((now - lastVouch[authorId]) / 1000) >= 43200
    } else { // never voted for him :(
        return true;
    }
}

const validURL = (str) => {
  const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(str);
}
