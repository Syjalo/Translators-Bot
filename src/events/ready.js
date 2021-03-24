const { botOwnerId } = require('@root/config.json')

module.exports = (client) => {
    client.once('ready', () => {
        client.owner = client.users.cache.get(botOwnerId)

        client.user.setActivity('you. Are you a translator? Execute -crowdinverify and verify yourself!', { type: 'WATCHING' })
        console.log('Ready!')
    })
}