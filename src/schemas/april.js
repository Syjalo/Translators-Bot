const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}
const reqObject = {
    type: Object,
    required: true
}

const aprilSchema = mongoose.Schema({
    guildId: reqString,
    channels: reqObject,
})

module.exports = mongoose.model('april', aprilSchema)