const   mongoose = require('mongoose'),
        bcrypt = require('bcrypt'),
        Promise = require('bluebird'),

        auth = require('../../auth'),
        
        config = require('../../config')(),
        roles = require('../../roles'),
        util = require('../../util'),
        emailUtil = require('../../email'),
        findModelUtil = require('./find-model.util'),

        userController = require('./user.controller'),
        chargeController = require('../charge'),

        Subscription = require('../../models/subscription.model'),
        Team = require('../../models/team.model'),
        Invite = require('../../models/invite.model'),
        Purchase = require('../../models/purchase.model'),
        HistoryModel = require('../../models/history.model'),
        Note = require('../../models/note.model');

module.exports = {

    get: (req, res) => {
        let id = req.params.id;
        return findModelUtil.findTeam(id)
            .then(t => {
                res.json(t);
            });
    },

    update: (req, res) => {
        let id = req.params.id;

        if (util.indexOfObjectId(req.user.adminOfTeams, id) == -1) {
            auth.unauthorized(req, res);
            return;
        } else {

            let oldTeam;
            return Team.findOne({}).where('_id').equals(id).exec()
                .then(team => {
                    oldTeam = team.toObject();
                    team = util.smartUpdate(team, req.body, findModelUtil.TEAM_WHITELIST);
                    return team.save();
                })
                .then(team => {
                    let changes = util.findChanges(oldTeam, team);
                    HistoryModel.create({
                        user: req.user._id,
                        action: 'team_edit',
                        changes: changes
                    });

                    res.json(team);
                });

        }
    },

    create: (req, res) => {
        let userId = req.user._id,
            name = req.body.name,
            email = req.body.email;

        return module.exports.doValidate(name)
            .then(e => {
                if (e) {
                    res.status(409).json(e);
                } else {
                    let team;
                    return Team.create({
                        name: name,
                        email: email,
                        addedUser: userId
                    }).then(t => {
                        team = t;
                        return findModelUtil.findUser(userId);
                    }).then(user => {
                        user.adminOfTeams.push(team._id);
                        user.save();

                        team.admins.push(user);
                        return team.save();
                    }).then(t => {
                        res.json(t);
                    });
                }
            });
    },

    backup: (req, res) => {

        Team.find({}).exec().then(t => {
            res.json(t);
        });
    },

    validate: (req, res) => {
        let name = req.body.name,
            teamId = req.body.teamId;

        return module.exports.doValidate(name, teamId).then(e => {
            if (e) {
                res.status(409).json(e)
            } else {
                res.end();
            }
        });
    },

    doValidate: function(name, teamId) {
        let promise = Team.findOne({}).where('name').equals(name);

        if (teamId) {
            promise.where('_id').ne(teamId);
        }
        
        return promise.exec()
            .then(t => {
                if (t) {
                    return Promise.resolve({
                        conflict: 'name'
                    });
                } else {
                    return Promise.resolve();
                }
            });
    },

    removeUser: (req, res) => {
        if (req.method != 'PUT') {
            return res.status(404);
        }

        let teamId = req.params.id,
            userId = req.params.toId;

        // user has to be an admin
        if (util.indexOfObjectId(req.user.adminOfTeams, teamId) == -1) {
            return util.unauthorized(req, res);
        }

        userController.removeUserFromTeam(userId, teamId, true).then(team => {
            // store a history of this having happened
            HistoryModel.create({
                user: req.user._id,
                action: 'team_user_remove',
                reference: userId
            });

            res.json(team);
        }, error => {
            if (error == 404) {
                util.notfound(req, res);
            } else {
                util.handleError(error);
            }
        });

    },

    promote: (req, res) => {
        if (req.method != 'PUT') {
            return res.status(404);
        }

        let teamId = req.params.id,
            userId = req.params.toId;

        // user has to be an admin
        if (util.indexOfObjectId(req.user.adminOfTeams, teamId) == -1) {
            return util.unauthorized(req, res);
        }

        return module.exports.switchTeamUserStatus(userId, teamId, true)
            .then(team => {
                HistoryModel.create({
                    user: req.user._id,
                    action: 'team_user_promote',
                    target: userId,
                    reference: teamId
                });
                res.json(team);
            });
    },

    demote: (req, res) => {
        if (req.method != 'PUT') {
            return res.status(404);
        }

        let teamId = req.params.id,
            userId = req.params.toId;

        // user has to be an admin
        if (util.indexOfObjectId(req.user.adminOfTeams, teamId) == -1) {
            return util.unauthorized(req, res);
        }

        return module.exports.switchTeamUserStatus(userId, teamId, false)
            .then(team => {
                HistoryModel.create({
                    user: req.user._id,
                    action: 'team_user_demote',
                    target: userId,
                    reference: teamId
                });
                res.json(team);
            });
    },

    switchTeamUserStatus: (userId, teamId, promote) => {
        return findModelUtil.findUser(userId)
            .then(user => {
                if (user) {
                    let addTo, removeFrom;
                    if (promote) {
                        addTo = 'adminOfTeams';
                        removeFrom = 'memberOfTeams';
                    } else {
                        addTo = 'memberOfTeams';
                        removeFrom = 'adminOfTeams';
                    }

                    user[removeFrom] = util.removeFromObjectIdArray(user[removeFrom], teamId);
                    user[addTo] = util.addToObjectIdArray(user[addTo], teamId);

                    return user.save();
                }
            })
            .then(() => {
                return findModelUtil.findTeam(teamId)
            })
            .then(team => {
                if (team) {
                    let addTo, removeFrom;
                    if (promote) {
                        addTo = 'admins';
                        removeFrom = 'members';
                    } else {
                        addTo = 'members';
                        removeFrom = 'admins';
                    }

                    team[removeFrom] = util.removeFromObjectIdArray(team[removeFrom], userId);
                    team[addTo] = util.addToObjectIdArray(team[addTo], userId);

                    return team.save();
                }
            })
            .then(team => {
                // make sure everything is populated properly
                return findModelUtil.findTeam(team._id.toString());
            })
    },

    invite: (req, res) => {

        let user = req.user,
            teamId = req.params.id,
            email = req.body.email;

        // first, see that the user requesting this is an admin of the team
        if (util.indexOfObjectId(user.adminOfTeams, teamId) > -1) {

            // get the team model
            Team.findOne({})
                .where('_id').equals(teamId)
                .exec()
                .then(team => {

                    //  check to see if the user has already been invited
                    Invite.count()
                        .where('email').equals(email)
                        .where('team').equals(teamId)
                        .where('accepted').equals(false)
                        .where('dateDeleted').equals(null)
                        .exec()
                        .then(existingCount => {
                            if (existingCount && existingCount > 0) {
                                res.status(409).json({error: 'invite already exists'});
                                return;
                            }

                            // check if the email address entered is already a user
                            findModelUtil.findUser(email)
                                .then(addUser => {
                                    // make sure they aren't already in this team
                                    if (addUser && (util.indexOfObjectId(addUser.memberOfTeams, teamId) > -1 ||
                                            util.indexOfObjectId(addUser.adminOfTeams, teamId) > -1)) {
                                        
                                        res.status(409).json({error: 'user already in team'});
                                        return;
                                    }

                                    // create a new invite object
                                    return Invite.create({
                                            user: req.user._id,
                                            email: email,
                                            role: roles.ROLE_USER,
                                            team: teamId
                                        })
                                        .then(invite => {
                                            // send an email to the user using the new invite's _id
                                            let inviteId = invite._id.toString(),
                                                name = user.firstName + ' ' + user.lastName,
                                                nameText = name.trim() ? 'Your colleague, ' + name + ', ' : 'Your colleague',
                                                link, subject, greeting, body, actionText,

                                                teamName = team.name;

                                            if (addUser) {
                                                subject = 'You have been invited to a Team on the Improv Database';
                                                let name = 'Hello ' + addUser.firstName;
                                                greeting = name.trim() + ','
                                                actionText = 'Accept Invitation';
                                                link = 'https://' + req.get('host') + '/app/dashboard';
                                            } else {
                                                subject = 'You have been invited to join the Improv Database',
                                                greeting = 'The Improv Database Awaits!';
                                                actionText = 'Join Now';
                                                link = 'https://' + req.get('host') + '/invite/' + inviteId;
                                            }

                                            body = `
                                                <p>${nameText} has invited you to join ${teamName} on the Improv Database.</p>
                                            `;

                                            if (!addUser) {
                                                body += `<p>The Improv Database is an online community for the world of Improv, helping Improvisers connect, share, and develop themselves and their techniques. By joining us, you will be able to get involved with this world as it evolves, and hopefully you'll be able to help shape the future of Improv around the world.</p>`;
                                            }

                                            if (!addUser || !addUser.subscription || addUser.subscription.expires < Date.now()) {
                                                body += `
                                                    <p>You can create an account on the database right now, and pay whatever you want (or nothing at all).</p>
                                                `;
                                            } else {
                                                body += `
                                                    <p>You already have an account on the Improv Database. Now you will be able to connect and collaborate with your teammates.</p>
                                                `;
                                            }

                                            emailUtil.send({
                                                to: email,
                                                subject: subject,
                                                content: {
                                                    type: 'text',
                                                    baseUrl: 'https://' + req.get('host'),
                                                    greeting: greeting,
                                                    body: body,
                                                    action: link,
                                                    actionText: actionText,
                                                    afterAction: `
                                                        <p>If that button doesn't work for you (or your email account messed up the contents of this message and you don't see any button), you can accept this invite by visiting <a href="${link}">${link}</a> in your browser.</p>

                                                        <p>Be excellent to each other, and party on.</p>

                                                        <p>Sincerely,</p>

                                                        <p>Shauvon McGill, creator.</p>
                                                    `
                                                }
                                            }, (error, response) => {

                                                team.invites.push(invite);
                                                team.save().then(t => {
                                                    if (addUser) {
                                                        addUser.invites.push(invite);
                                                        addUser.save();

                                                        invite = invite.toObject();
                                                        invite.inviteUser = {
                                                            firstName: addUser.firstName,
                                                            lastName: addUser.lastName,
                                                            email: addUser.email,
                                                            _id: addUser._id,
                                                            subscription: addUser.subscription
                                                        };
                                                    }
                                                    res.json(invite);
                                                });

                                            })
                                        });
                                })
                        });

                });

        } else {
            auth.unauthorized(req, res);
        }

    },

    notes: (req, res) => {
        let teamId = req.params.id;

        if (util.indexOfObjectId([].concat(req.user.adminOfTeams, req.user.memberOfTeams), teamId) > -1) {

            return findModelUtil.findNotes(null, req.user, null, null, null, teamId, true)
                .then(notes => {
                    res.json(notes)
                });

        } else {
            util.unauthorized(req, res);
        }
    }

}