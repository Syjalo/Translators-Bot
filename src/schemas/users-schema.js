const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}
const string = {
    type: String,
    required: false
}

const usersSchema = mongoose.Schema({
    id: reqString,
    crowdinId: string,
})

module.exports = mongoose.model('users', usersSchema)