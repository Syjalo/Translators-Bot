const Discord = require('discord.js')

const { prefix } = require('@root/config.json')

module.exports = async (client, message) => {
    if(!message.content.startsWith(prefix) && message.mentions.users.first()?.id !== client.user.id) return
    let args
    if(message.content.startsWith(prefix)) args = message.content.slice(prefix.length).split(' ')
    else {
        args = message.content.split(' ')
        args.shift()
    }
    const commandName = args.shift().toLowerCase()
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
    if(!command) return

    const channelsBlacklist = command.channelsBlacklist || []
    const channelsWhitelist = command.channelsWhitelist || []
    const allowedInDm = command.allowedInDm || false
    
    let flag = true
    if(channelsBlacklist[0] === 'each') flag = false
    if(channelsBlacklist.some(c => message.channel.id === c)) flag = false
    if(channelsWhitelist[0] === 'each') flag = true
    if(channelsWhitelist.some(c => message.channel.id === c)) flag = true
    if(!allowedInDm && message.channel.type === 'dm') flag = false
    if(allowedInDm && message.channel.type === 'dm') flag = true
    if(message.member?.hasPermission('ADMINISTRATOR')) flag = true
    if(!flag) {
        if(message.channel.type === 'dm') return
        message.react('❌')
        setTimeout(() => {
            if(!message.deleted && message.deletable) message.delete()
        }, 3000)
        return
    }

    try {
        await command.execute(message, args, client)
    } catch(error) {
        console.error(error)
        const embed = new Discord.MessageEmbed()
        .setTitle('An error occurred while running the command\nI sent this error to the Developer. He\'ll fix it soon.')
        .setColor('#FF0000')
        message.channel.send(embed)
        if(error.stack) {
            console.error(`Error found at ${command.name} command. Channel type: ${message.channel.type}. Executed by ${message.author.tag} (${message.author.id}).\nMessage content: ${message.content}\n${error.stack}`)
            if(process.env.TERM_PROGRAM !== 'vscode') {
                const embed = new Discord.MessageEmbed()
                .setAuthor('Error Found')
                .setTitle(`Error found at ${command.name} command. Channel type: ${message.channel.type}. Executed by ${message.author.tag} (${message.author.id}).`)
                .setDescription(`Message content: ${message.content}\n${error.stack}`)
                .setColor('#FF0000')
                client.owner.send(embed)
            }
        }
    }
}
