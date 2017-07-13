const mongoose = require('mongoose'),
    Promise = require('bluebird'),
    bcrypt = require('bcrypt'),
    fs = require('fs'),
    path = require('path'),
    aws = require('aws-sdk');

var config = require('./config')();

const charge = require('./routes/charge'),
    roles = require('./roles'),
    util = require('./util');

const Contact = require('./models/contact.model.js');
const InviteModel = require('./models/invite.model');
const Subscription = require('./models/subscription.model');
const Purchase = require('./models/purchase.model');
const User = require('./models/user.model');
const Team = require('./models/team.model');
const Preference = require('./models/preference.model');
const HistoryModel = require('./models/history.model');

const Game = require('./models/game.model'),
    GameMetadata = require('./models/game-metadata.model'),
    NameVote = require('./models/name-vote.model'),
    Name = require('./models/name.model'),
    Note = require('./models/note.model'),
    Tag = require('./models/tag.model');

    
mongoose.Promise = Promise;
if (!mongoose.connection.readyState) {
    mongoose.connect(config.mongodb.uri);
}

const backuptime = 1497465510504;
const   databases = {
        'Invite': {
            time: backuptime,
            model: InviteModel
        },
        'Preference': {
            time: backuptime,
            model: Preference
        },
        'Purchase': {
            time: backuptime,
            model: Purchase
        },
        'Subscription': {
            time: backuptime,
            model: Subscription,
            seed: (timestamp) => {
                return Promise.resolve();
            }
        },
        'Team': {
            time: backuptime,
            model: Team
        },
        'User': {
            time: backuptime,
            model: User,
            seed: (timestamp) =>{
                return doSeed('User', timestamp, (users) => {
                    let useThese = [];
                    users.forEach(user => {
                        if (user.email != 'kate@katebringardner.com') {
                            // hash the password if it isn't already
                            if (user.password.substr(0,2) !== '$2') {
                                let salt = bcrypt.genSaltSync(config.saltRounds),
                                    password = user.password;
                                user.password = bcrypt.hashSync(password, salt);
                            }
                            delete user.subscription;
                            useThese.push(user);
                        }
                    });
                    return useThese;
                }, (users) => {
                    return util.iterate(users, user => {
                        if (user.email == 'smcgill@denyconformity.com') {
                            return user.addSubscription('', '', '', 19);
                        } else {
                            return user.addSubscription();
                        }
                    });
                });
            }
        },
        'History': {
            time: backuptime,
            model: HistoryModel
        },
        'GameMetadata': {
            time: backuptime,
            model: GameMetadata
        },
        'Game': {
            time: backuptime,
            model: Game,
            seed: (timestamp) => {
                return doSeed('Game', timestamp, (data) => {
                    data.forEach(item => {
                        if (item.tags.length && item.tags[0].tag) {
                            let newTags = [];
                            item.tags.forEach(taggame => {
                                newTags.push(taggame.tag);
                                HistoryModel.create({
                                    user: taggame.addedUser,
                                    date: taggame.dateAdded,
                                    action: 'game_tag_add',
                                    target: item._id,
                                    reference: taggame.tag
                                });
                            });
                            item.tags = newTags;
                        }
                    })
                    return data;
                });
            }
        },
        'Name': {
            time: backuptime,
            model: Name
        },
        'NameVote': {
            time: backuptime,
            model: NameVote
        },
        'Note': {
            time: backuptime,
            model: Note
        },
        'Tag': {
            time: backuptime,
            model: Tag
        }
    };

function doDelete(key) {
    console.log('deleting ' + key);
    return databases[key].model.find({}).remove().exec();
}

// functions to seed everything
function doSeed(key, timestamp, dataProcess, afterCreate, cancelCreate) {
    let seedData = [];

    const s3 = new aws.S3();

    timestamp = timestamp || databases[key].time;

    console.log('attempting to seed ' + key + ' from ' + timestamp);

    return new Promise((resolve, reject) => {

        let params = {
                Bucket: config.s3_buckets.backups,
                Key: key + '_' + timestamp + '.json'
            };

        s3.getObjectTagging(params, (tagErr, data) => {
            if (!tagErr) {
                s3.getObject(params, (objectErr, data) => {

                    if (!objectErr && data.Body) {
                        seedData = JSON.parse(data.Body.toString());

                        if (seedData.length && !cancelCreate) {

                            if (typeof(dataProcess) == 'function') {
                                seedData = dataProcess(seedData);
                            }

                            return databases[key].model.create(seedData)
                                .then(models => {
                                    if (typeof(afterCreate) == 'function') {
                                        return afterCreate(models);
                                    } else {
                                        return Promise.resolve();
                                    }
                                }).then(() => {
                                    console.log(key + ' seeded');
                                    console.log(' -- ');
                                    resolve();
                                });
                        } else if (!cancelCreate) {
                            console.log(key + ' has no seed file (or the seed file is empty)');
                            console.log(' -- ');
                            resolve();
                        }
                    } else {
                        console.log(key + ' error ', objectErr);
                        console.log(' -- ');
                        resolve();
                    }
                })
            } else {
                console.log(key + ' error', tagErr);
                console.log(' -- ');
                resolve();
            }
        });

    });
    
}

function resetAllTimes() {
    return DBInfo.find({}).remove();
}

function cleanup() {
    // remove names that don't go with a game
    // let namesToRemove = [];
    return Name.find({}).exec().then(names => {
        return util.iterate(names, (name) => {
            let gameId = name.game;
            return Game.find({}).where('_id').equals(gameId).exec()
                .then(games => {
                    if (!games || !games.length) {
                        // namesToRemove.push(name);
                        console.log('Removing name ' + name.name);
                        return name.remove();
                    } else {
                        return Promise.resolve();
                    }
                })
            })
        });
}

const DBInfo = require('./models/dbinfo.model');

module.exports = {

    databases: databases,

    clear: function() {
        util.iterate(Object.keys(databases), (key) => {
            return doDelete(key);
        })
            .then(resetAllTimes)
            .then(() => {
                process.exit(0);
            });
    },

    reset: function() {
        console.log('resetting all of the things');
        module.exports.checkForSeed(true);
    },

    cleanup: function() {
        cleanup().then(() => {
            process.exit(0);
        })
    },

    checkForSeed: function(force, timestamp, noExit) {

        let keys = Object.keys(databases);

        return DBInfo.count({}).exec()
            .then(count => {
                if (count == 1) {
                    return resetAllTimes();
                }
            })
            .then(() => {
                return util.iterate(keys, (key) => {
                    return DBInfo.findOne({})
                        .where('key').equals(key).exec()
                        .then(info => {
                            if (!info) {
                                return DBInfo.create({
                                    key: key,
                                    latest: 0
                                });
                            } else {
                                return Promise.resolve(info);
                            }
                        })
                        .then(info => {
                            if (info.latest < databases[key] || force) {
                                if (!force) {
                                    console.log(key + ' backup is more recent than database!');
                                }

                                return doDelete(key)
                                    .then(() => { 
                                        if (databases[key].seed) {
                                            return databases[key].seed(timestamp) 
                                        } else {
                                            return doSeed(key, timestamp);
                                        }
                                    })
                                    .then(() => {
                                        info.latest = Date.now();
                                        return info.save();
                                    });
                            } else {
                                console.log('No need to reset ' + key + ' database');
                                return Promise.resolve(true);
                            }
                        })
                })
            })
            .then(() => {
                if (!noExit) {
                    process.exit(0);
                }
            })
    }

}