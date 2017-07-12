const mongoose = require('mongoose');

const DBInfoSchema = new mongoose.Schema({
    created: {type: Date, default: Date.now},
    key: String,
    latest: Date
})

const DBInfo = mongoose.model('DBInfo', DBInfoSchema);

module.exports = DBInfo;