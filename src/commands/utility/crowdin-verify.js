const Discord = require('discord.js')
const fetch = require('node-fetch')
const puppeteer = require('puppeteer')

const usersSchema = require('@schemas/users-schema')

module.exports = {
    name: 'crowdinverify',
    aliases: ['cverify', 'c'],
    channelsBlacklist: ['each'],
    channelsWhitelist: ['738589611919540346', '748847925886713967'],
    async execute(message, args, client) {
        message.channel.startTyping()
        const crowdinKey = process.env.CROWDIN_KEY
        const url = `https://api.crowdin.com/api/v2/projects/420740/members/?search=${args[0]}&limit=10`
        const options = { headers: { "Content-Type": "application/json", "Authorization": "Bearer " + crowdinKey }, timeout: 10000 }
        const response = await fetch(url, options)
        .then(r => r.json())
        .then(json => { return json })
        .catch(() => {
            const embed = new Discord.MessageEmbed()
            .setTitle('Something went wrong when connecting to the API!')
            .setDescription('Please try again later.')
            .setColor('##FF0000')
            message.channel.send(embed)
            message.channel.stopTyping(true)
            return
        })
        if(!response?.data[0]) {
            const embed = new Discord.MessageEmbed()
            .setTitle('Couldn\'t find the user')
            .setDescription('You may not have joined the [project](https://crwd.in/pojavlauncher) or specify the Crowdin username incorrectly.')
            .setColor('#FF0000')
            message.channel.send(embed)
            message.channel.stopTyping(true)
            return
        }

        const members = response.data
        let member
        if(members[1]) {
            let membersList = ''
            for(let member of members) {
                membersList += `${members.indexOf(member) + 1}. [${member.data.fullName} (${member.data.username})](https://crowdin.com/profile/${member.data.username})\n`
            }
            const embed = new Discord.MessageEmbed()
            .setTitle('Who is you?')
            .setDescription(membersList)
            .addField('Can\'t find yourself?', 'Try to specify a more precise Crowdin username.')
            .setColor('#ffa000')
            await message.channel.send(embed)
            .then(async whoIsYouMsg => {
                message.channel.stopTyping()
                const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
                for(let i = 0; i < members.length; i++) { whoIsYouMsg.fetch(true); if(!whoIsYouMsg.deleted) await whoIsYouMsg.react(emojis[i]) }
                const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id
                await whoIsYouMsg.awaitReactions(filter, { timeout: 15000, max: 1 })
                .then(collected => { if(!whoIsYouMsg.deleted) whoIsYouMsg.delete(); member = members[emojis.indexOf(collected.first()._emoji.name)].data })
            })
        } else {
            member = members[0].data
        }

        message.channel.startTyping()
        const browser = await puppeteer.launch()
        let page = await browser.newPage()
        await page.setViewport({ width: 1400, height: 900 })
        const profileUrl = `https://crowdin.com/profile/${member.username}`
        await page.goto(profileUrl)
        await page.waitForSelector('div.profile-left-pane')

        let userDb
        await client.mongo().then(async (mongoose) => {
            try {
                userDb = await usersSchema.findOne({
                    id: message.author.id
                })
            } finally {
                mongoose.connection.close()
            }
        })
        const translatorRole = client.guilds.cache.get('724163890803638273').roles.cache.get('738912009193521224')
        const result = await page.evaluate(async (tag) => {
            return document.querySelector('div.user-about')?.textContent?.includes(tag)
        }, message.author.tag)
        browser.close()
        if(result) {
            message.member.roles.add(translatorRole)
            await client.mongo().then(async (mongoose) => {
                try {
                    await usersSchema.findOneAndUpdate({
                        id: message.author.id
                    }, {
                        id: message.author.id,
                        crowdinId: member.id
                    }, {
                        upsert: true
                    })
                } finally {
                    mongoose.connection.close()
                }
            })
            const embed = new Discord.MessageEmbed()
            .setTitle('Verified successfully')
            .setDescription(`You were given the ${translatorRole} role!`)
            .setColor('#00FF00')
            message.channel.send(embed)
        } else if(userDb?.crowdinId) {
            const embed = new Discord.MessageEmbed()
            .setTitle('Verification failed')
            .setDescription('I couldn\'t verify you because you didn\'t specify your Discord tag in the "About me" section.\nYou can change it in your account settings.')
            .setColor('#FF0000')
            message.channel.send(embed)
        } else {
            message.member.roles.remove(translatorRole)
            const embed = new Discord.MessageEmbed()
            .setTitle('Verification failed')
            .setDescription('I couldn\'t verify you because you didn\'t specify your Discord tag in the "About me" section.\nYou can change it in your account settings.')
            .setColor('#FF0000')
            message.channel.send(embed)
        }
        message.channel.stopTyping(true)
    }
}