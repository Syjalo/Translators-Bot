const aprilSchema = require('@schemas/april')

module.exports = {
    name: 'april',
    permissionsWhitelist: ['ADMINISTRATOR'],
    async execute(message, args, client) {
        if(message.author.id === '406028548034396160') {
            if(args[0] === 'read') {
                const ch = message.guild.channels.cache
                const channels = {}
                ch.each(c => {channels[c.id] = c.name})
                await client.mongo().then(async (mongoose) => {
                    try {
                        await aprilSchema.findOneAndUpdate({
                            guildId: message.guild.id
                        }, {
                            guildId: message.guild.id,
                            channels
                        }, {
                            upsert: true
                        })
                    } finally {
                        mongoose.connection.close()
                    }
                })
                message.channel.send('Done!')
            }
        }

        if(args[0] === 'start') {
            message.guild.channels.cache.each(c => c.setName('off-topic', 'April Joke'))
        }

        if(args[0] === 'stop') {
            message.channel.startTyping()
            await client.mongo().then(async (mongoose) => {
                let channels
                try {
                    channels = await aprilSchema.findOne({
                        guildId: message.guild.id
                    })
                } finally {
                    mongoose.connection.close()
                }
                for(let index in channels.channels) {
                    const channel = message.guild.channels.cache.get(index)
                    if(channel) channel.setName(channels.channels[index], 'April Joke')
                }
            })
        }
        message.channel.stopTyping(true)
    }
}