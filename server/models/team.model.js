const mongoose = require('mongoose'),

    util = require('../util'),

    User = require('./user.model'),
    Invite = require('./invite.model');

const TeamSchema = new mongoose.Schema({
    name: String,
    description: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    url: String,

    primaryColor: String,
    secondaryColor: String,
    tertiaryColor: String,

    addedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateAdded: { type: Date, default: Date.now },
    
    modifiedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateModified: { type: Date, default: Date.now },

    lookingForMembers: Boolean,

    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    invites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invite' }]
});

TeamSchema.methods.addUser = function(user) {
    this.members = util.addToObjectIdArray(this.members, user);
    return this.save();
}

TeamSchema.methods.removeUser = function(user) {
    this.members = util.removeFromObjectIdArray(this.members, user);
    return this.save();
}

TeamSchema.methods.addAdmin = function(user) {
    this.members = util.removeFromObjectIdArray(this.members, user);
    this.admins = util.addToObjectIdArray(this.admins, user);
    return this.save();
}

TeamSchema.methods.removeAdmin = function(user) {
    this.admins = util.removeFromObjectIdArray(this.admins, user);
    return this.save();
}

TeamSchema.virtual('isThisAUser').get(function() {
    return false;
});

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;