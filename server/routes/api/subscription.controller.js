const mongoose = require('mongoose');

const auth = require('../../auth');

const Subscription = require('../../models/subscription.model');

getSubs = (userId, populate) => {
    return Subscription
        .find({})
        .where('user').equals(userId)
        .where('expires').gt(Date.now())
        .select('expires dateAdded')
        .exec();
}

module.exports = {

    getAll: (req, res) => {

        if (req.user._id) {
            getSubs(req.user._id, 2)
                .catch(err => {
                    res.status(500).json(err)
                })
                .then(subs => {
                    res.json(subs);
                });
        } else {
            res.json([]);
        }

    },

    getSubs: getSubs,

    backup: (req, res) => {
        Subscription.find({}).exec()
            .then(s => {
                res.json(s);
            })
    }

}