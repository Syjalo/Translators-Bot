const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

module.exports = async (client) => {
    client.commands = new Discord.Collection()
    client.cooldowns = new Discord.Collection()
    client.mongo = require('@utilities/mongo')

    // Load commands
    const readCommands = (dir) => {
        const files = fs.readdirSync(path.join(__dirname, dir))
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file))
            if (stat.isDirectory()) {
                readCommands(path.join(dir, file))
            } else {
                const command = require(path.join(__dirname, dir, file))
                client.commands.set(command.name, command)
            }
        }
    }
    readCommands('../commands')

    // Load events
    const readEvents = (dir) => {
        const files = fs.readdirSync(path.join(__dirname, dir))
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file))
            if (stat.isDirectory()) {
                readEvents(path.join(dir, file))
            } else {
                const event = require(path.join(__dirname, dir, file))
                event(client)
            }
        }
    }
    readEvents('../events')
}