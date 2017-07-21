const mongoose = require('mongoose');
        
const   util = require('../../util'),
        findModelUtil = require('./find-model.util');

const   Game = require('../../models/game.model'),
        Name = require('../../models/name.model'),
        Note = require('../../models/note.model'),
        Tag = require('../../models/tag.model'),
        HistoryModel = require('../../models/history.model');

module.exports = {

    create: (req, res) => {

        let data = req.body,
            userId = req.user._id,
            gameData = {
                addedUser: userId,
                description: data.description
            };
        
        Game.create(gameData)
            .then(game => {
                return updateGame(game, data, userId)
            })
            .then(game => {
                res.json(game);
            }, error => {
                util.handleError(req, res, error);
            });

    },

    delete: (req, res) => {

        let gameId = req.params.id;

        Game.findOne({})
            .where('_id').equals(gameId).exec()
            .then(game => {
                if (game) {

                    game.dateDeleted = Date.now();
                    game.deletedUser = req.user._id;

                    return game.save().then(game => {
                        //res.send('success');
                        return util.iterate(game.names, nameId => {
                            return Name.findOne({}).where('_id').equals(nameId).exec()
                                .then(name => {
                                    name.dateDeleted = Date.now();
                                    name.deletedUser = req.user._id;
                                    return name.save();
                                });
                        });
                    }).then(() => {
                        res.send('success');
                    });
                } else {
                    return res.status(404).send('game not found');
                }
            });

    },

    update: (req, res) => {

        let data = req.body,
            userId = req.user._id,
            gameId = req.params.id || data._id,
            oldGame;
        
        return Game.findOne({}).where('_id').equals(gameId).exec()
            .then(game => {
                oldGame = game.toObject();
                return updateGame(game, data, userId);
            })
            .then(game => {
                if (data.description) {
                    game.description = data.description;
                }
                game.modifiedUser = userId;
                game.dateModified = Date.now();

                let changes = util.findChanges(oldGame, game);

                HistoryModel.create({
                    user: userId,
                    action: 'game_edit',
                    target: game._id,
                    changes: changes
                });
                
                return game.save();
            })
            .then(game => {
                return getGames(req.user, game._id);
            })
            .then(game => {
                res.json(game[0]);
            }, error => {
                util.handleError(req, res, error);
            });

    },

    getAll: (req, res) => {
        getGames(req.user)
            .then(games => {
                res.json(games);
            }, error => {
                util.handleError(req, res, error);
            });
    },

    get: (req, res) => {
        getGames(req.user, req.params.id)
            .then(games => {
                if (games[0]) {
                    res.json(games[0]);
                } else {
                    util.notfound(req, res);
                }
            }, error => {
                util.handleError(req, res, error);
            });
    },

    addTag: (req, res) => {
        let gameId = req.params.id,
            tagId = req.params.toId;

        return getGames(req.user, gameId).then(games => {
            let game = games[0];
            return game.addTag(null, tagId, req.user._id);
        }).then(game => {
                game.tags.sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
                res.json(game);
            }, error => {
                util.handleError(req, res, error);
            });
    },

    removeTag: (req, res) => {
        let gameId = req.params.id,
            tagId = req.params.toId;

        return getGames(req.user, gameId).then(games => {
            let game = games[0];
            return game.removeTag(tagId, req.user._id);
        }).then(game => {
            res.json(game);
        }, error => {
            util.handleError(req, res, error);
        })
    },

    createTag: (req, res) => {
        let gameId = req.params.id,
            tag = req.body.name;
        
        return getGames(req.user, gameId).then(games => {
            let game = games[0];
            return game.addTag(tag, null, req.user._id);
        }).then(game => {
                game.tags.sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
                res.json(game);
            }, error => {
                util.handleError(req, res, error);
            });
        
        // }).then(game => {
        //     return Tag.findOne({}).where('name').equals(tag).exec();
        // }).then(tag => {
        //     res.json(tag);        
        // });
    },

    backup: (req, res) => {
        return Game.find({})
            .then(games => {
                res.json(games);
            })
    },

    /**
     * /api/game/{id}/notes
     * 
     * Fetch all the notes that apply to a given game, whether it's the game itself or the metadata applied to it
     */
    notes: (req, res) => {
        let gameId = req.params.id,
            userId = req.user._id,
            metadataIds = [],
            tagIds = [],
            orClause = [{addedUser: userId}];

        if (req.user.actions.indexOf('note_public_view') > -1) {
            orClause.push({public: true});
        }

        if (req.user.actions.indexOf('note_team_view') > -1) {
            let teams = [].concat(req.user.memberOfTeams, req.user.adminOfTeams);
            orClause.push({team: { $in: teams }});
        }

        return Game.findOne({}).where('_id').equals(gameId).exec()
            .then(game => {
                if (game.playerCount && game.playerCount !== undefined) {
                    metadataIds.push(game.playerCount);
                }
                if (game.duration && game.duration !== undefined) {
                    metadataIds.push(game.duration);
                }
                game.tags.forEach(tag => {
                    tagIds.push(util.getObjectIdAsString(tag));
                });

                return findModelUtil.findNotes(null, req.user, gameId, metadataIds, tagIds);
            })
            .then(notes => {
                res.json(notes);
            });
    }

}

function updateGame(game, data, userId) {

    let gamePromise;

    if (data.duration && data.duration != game.duration) {
        gamePromise = game.addMetadata(data.duration);
    } else {
        gamePromise = Promise.resolve(game);
    }

    return gamePromise.then(game => {
        if (data.playerCount && data.playerCount != game.playerCount) {
            return game.addMetadata(data.playerCount);
        } else {
            return Promise.resolve(game);
        }
    });

}

function getGames(user, id) {
    
    let query = Game.find({}).where('dateDeleted').equals(null);

    query.select('addedUser dateAdded dateModified description modifiedUser names');

    query
        .populate({
            path: 'names',
            select: 'name votes weight dateAdded dateModified',
            populate: {
                path: 'votes'
            },
            options: {
                sort: '-weight -dateAdded'
            }
        })
        .populate({
            path: 'addedUser',
            select: 'firstName lastName'
        })
        .populate({
            path: 'modifiedUser',
            select: 'firstName lastName'
        })

    if (user.actions.indexOf('metadata_view') > -1) {
        query.select('playerCount duration')
        .populate({
            path: 'playerCount',
            select: 'name description',
        })
        .populate({
            path: 'duration',
            select: 'name description'
        })
    }

    if (user.actions.indexOf('tag_view') > -1) {
        query.select('tags')
        .populate({
            path: 'tags',
            select: 'name description',
            options: {
                sort: 'name'
            }
        })
    }

    if (id) {
        query.where('_id').equals(id);
    }

    return query.exec();
}