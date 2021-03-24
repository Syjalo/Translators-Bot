require('module-alias/register')
require("dotenv").config()

const Discord = require('discord.js')
const loader = require('@utilities/loader')

const client = new Discord.Client()

loader(client)

client.login(process.env.TOKEN)