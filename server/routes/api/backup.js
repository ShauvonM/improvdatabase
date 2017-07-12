const mongoose = require('mongoose'),
    Promise = require('bluebird'),
    bcrypt = require('bcrypt'),
    fs = require('fs'),
    path = require('path');
    aws = require('aws-sdk');

var config = require('../../config')();

const charge = require('../charge'),
    roles = require('../../roles'),
    util = require('../../util');

let databases = {
    'Invite': require('../../models/invite.model'),
    'Preference': require('../../models/preference.model'),
    'Purchase': require('../../models/purchase.model'),
    'Subscription': require('../../models/subscription.model'),
    'Team': require('../../models/team.model'),
    'User': require('../../models/user.model'),
    'History': require('../../models/history.model'),

    'GameMetadata': require('../../models/game-metadata.model'),
    'Game': require('../../models/game.model'),
    'Name': require('../../models/name.model'),
    'NameVote': require('../../models/name-vote.model'),
    'Note': require('../../models/note.model'),
    'Tag': require('../../models/tag.model')
};

module.exports = {
    
    backupAll: function(req, res) {
        const s3 = new aws.S3();

        let keys = Object.keys(databases),
            timestamp = Date.now();

        return util.iterate(keys, (key) => {
            let model = databases[key];

            return model.find({}).exec()
                .then(data => {
                    s3.upload({
                        Bucket: config.s3_buckets.backups,
                        Key: key + '_' + timestamp + '.json',
                        Body: JSON.stringify(data)
                    }, function() {
                        console.log('backup of ' + key + ' complete');
                    });
                });
        }).then(() => {
            res.json({done: 'very yes', timestamp: timestamp});
        });

    }

}