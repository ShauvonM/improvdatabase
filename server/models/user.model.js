const mongoose  = require('mongoose'),

    Preference  = require('./preference.model'),
    roles       = require('../roles');

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String,
    title: String,
    company: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    improvExp: Number,
    facilitationExp: Number,
    trainingInterest: Boolean,
    url: String,
    birthday: Date,
    dateAdded: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now },
    locked: { type: Boolean, default: false },
    description: String,
    permissions: String, // in case we want to grant or revoke specific permissions
    superAdmin: { type: Boolean, default: false },

    memberOfTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    adminOfTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],

    purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' }],
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    preferences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Preference' }],
    invites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Invite'}],

    dateLoggedIn: Date
});

UserSchema.methods.addSubscription = function(pledge, stripeCustomerId, stripeSubscriptionId, role, expires) {
    if (!expires) {
        expires = new Date();
        expires.setFullYear(2233);
    }
    let expiration = Date.now();
    if (typeof(expires) == 'object' && expires.getTime) {
        expiration = expires.getTime();
    }
    if (!role) {
        if (pledge && pledge > 0 && stripeCustomerId) {
            role = roles.ROLE_USER_PAID;
        } else {
            role = roles.ROLE_USER;
        }
    }
    return mongoose.model('Subscription').create({
        user: this._id,
        role: role,
        expiration: expiration,
        pledge: pledge,
        stripeCustomerId: stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId
    }).then(sub => {
        this.subscription = sub;

        return this.save();
    });
}

UserSchema.methods.setSubscriptionRole = function(role) {
    let subId;

    if (this.subscription && this.subscription._id) {
        subId = this.subscription._id;
    } else if (this.subscription) {
        subId = this.subscription;
    } else {
        return this.save();
    }

    return mongoose.model('Subscription').findOne({})
        .where('_id').equals(subId)
        .exec()
        .then(sub => {
            sub.role = role;
            return sub.save();
        })
        .then(sub => {
            return this.save();
        });
}

// TODO: create a renewSubscription method?

UserSchema.methods.setPreference = function(key, value) {
    return Preference.findOne({})
        .where('key').equals(key)
        .where('user').equals(this._id)
        .exec()
        .then(pref => {
            if (pref) {
                if (value) {
                    pref.value = value;
                    pref.date = Date.now();
                    return pref.save();
                } else {
                    // remove it from the array
                    this.preferences.remove(pref._id);
                    return pref.remove();
                }
            } else {
                return Preference.create({
                    key: key,
                    value: value,
                    user: this._id
                });
            }
        }).then(pref => {
            if (pref) {
                // update it if it already exists, and add it if it doesn't
                let found = false;
                this.preferences.forEach(p => {
                    if (p == pref._id.toString()) {
                        found = true;
                        p = pref;
                    }
                });
                if (!found) {
                    this.preferences.push(pref);
                }
            }

            return this.save();
        })
}

UserSchema.virtual('isThisAUser').get(function() {
    return true;
});

UserSchema.virtual('fullName')
    .get(function() {
        return (this.firstName + ' ' + this.lastName).trim();
    })
    .set(function(v) {
        this.firstName = v.substr(0, v.indexOf(' '));
        this.lastName = v.substr(v.indexOf(' ') + 1);
    });

UserSchema.virtual('simpleName')
    .get(function() {
        if (this.firstName) {
            return this.firstName;
        } else {
            return 'Improv Database user';
        }
    })

const User = mongoose.model('User', UserSchema);

module.exports = User;