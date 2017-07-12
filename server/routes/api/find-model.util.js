const   mongoose = require('mongoose'),
        bcrypt = require('bcrypt'),
        Promise = require('bluebird'),

        Team = require('../../models/team.model'),
        User = require('../../models/user.model'),
        Note = require('../../models/note.model');

module.exports = {

    USER_WHITELIST: [
        'email',
        'firstName',
        'lastName',
        'title',
        'company',
        'phone',
        'address',
        'city',
        'state',
        'zip',
        'country',
        'improvExp',
        'facilitationExp',
        'trainingInterest',
        'url',
        'description',
        'birthday'
    ],

    TEAM_WHITELIST: [
        'email',
        'name',
        'company',
        'phone',
        'address',
        'city',
        'state',
        'zip',
        'country',
        'url',
        'description'
    ],

    findUser: (key, select, populate) => {
        if (!key) {
            return Promise.reject('no id or email');
        }

        let query = User.findOne({})
            .select(module.exports.USER_WHITELIST.join(' ') + 
            ' subscription preferences invites memberOfTeams adminOfTeams role dateAdded dateModified superAdmin locked dateLoggedIn ' + select);

        // catch a mongoose ObjectID, which looks like a string but isn't really
        if (typeof(key) == 'object' && key.toString) {
            key = key.toString();
        }

        if (key.indexOf && key.indexOf('@') > -1) {
            query.where('email').equals(key);
        } else {
            query.where('_id').equals(key);
        }

        query.populate('preferences')
            .populate({
                path: 'invites',
                populate: {
                    path: 'team user',
                    select: 'name firstName lastName'
                },
                match: {
                    accepted: false,
                    dateDeleted: null
                }
            })
            .populate({
                path: 'subscription',
                select: '-stripeCustomerId'
            })

        if (populate) {
            query.populate(populate);
        }

        return query.exec()
            .catch(error => {
                return Promise.resolve(null);
            })
            // .then(user => {
            //     if (user && !raw) {
            //         user = module.exports.prepUserObject(user);
            //     }

            //     return Promise.resolve(user);
            // });
    },
    
    findTeam: (teamId, select, populate) => {
        let promise = Team.findOne({}).where('_id').equals(teamId)
            .populate({
                path: 'admins members',
                select: '-password',
                populate: {
                    path: 'subscription',
                    select: '-stripeCustomerId'
                }
            })
            .populate({
                path: 'invites',
                match: {
                    accepted: false,
                    dateDeleted: undefined
                }
            });

        if (select) {
            promise.select(select);
        }

        if (populate) {
            promise.populate(populate);
        }

        return promise.exec();
    },

    findNotes: (noteId, user, gameId, metadataIds, tagIds) => {

        let userOr = []
        
        // if (!user.superAdmin) {
            userOr.push({addedUser: user._id});

            if (user.actions.indexOf('note_public_view') > -1) {
                userOr.push({public: true});
            }

            if (user.actions.indexOf('note_team_view') > -1) {
                let teams = [].concat(user.memberOfTeams, user.adminOfTeams);
                userOr.push({teams: { $in: teams }});
            }
        // }

        let query;

        if (noteId) {
            query = Note.findOne({});
            query.where('_id').equals(noteId);
        } else {
            query = Note.find({});
        }

        let whereOr = [],
            and = [];

        if (gameId) {
            whereOr.push({game: gameId});
        }
        if (metadataIds && metadataIds.length) {
            whereOr.push({metadata: {$in: metadataIds}});
        }
        if (tagIds && tagIds.length) {
            whereOr.push({tag: { $in: tagIds }});
        }

        if (userOr.length) {
            and.push({ $or: userOr });
        }

        if (whereOr.length) {
            and.push({ $or: whereOr })
        }

        if (and && and.length) {
            query = query.and(and);
        }

        return query
            .where('dateDeleted').equals(null)
            .populate({
                path: 'teams',
                select: 'name'
            })
            .populate({
                path: 'tag',
                select: 'name description games'
            })
            .populate({
                path: 'metadata',
                select: 'name description type games'
            })
            .populate({
                path: 'addedUser',
                select: 'firstName lastName'
            })
            .populate({
                path: 'modifiedUser',
                select: 'firstName lastName'
            })
            .exec();
    }
}