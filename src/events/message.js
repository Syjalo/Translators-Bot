const Discord = require('discord.js')

const commandsHandler = require('@handlers/commands-handler')

module.exports = (client) => {
    client.on('message', async (message) => {
        if(message.author.bot) return
        commandsHandler(client, message)
    })
}