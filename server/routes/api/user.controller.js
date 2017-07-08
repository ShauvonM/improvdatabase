const   mongoose = require('mongoose'),
        bcrypt = require('bcrypt'),
        Promise = require('bluebird'),
        
        config = require('../../config')(),
        roles = require('../../roles'),
        util = require('../../util'),
        emailUtil = require('../../email'),
        findModelUtil = require('./find-model.util'),

        chargeApi = require('../charge'),

        Subscription = require('../../models/subscription.model'),
        User = require('../../models/user.model'),
        Team = require('../../models/team.model'),
        Purchase = require('../../models/purchase.model'),
        Invite = require('../../models/invite.model'),
        HistoryModel = require('../../models/history.model');

module.exports = {

    /**
     * POST: /api/user is used to accept an invitation and create a new user
     */
    create: (req, res) => {
        
        let email = req.body.email,
            password = req.body.password,
            inviteId = req.body.invite,
            userName = req.body.name;

        if (!email || !password || !inviteId || !userName) {
            return res.status(500).json({error: 'Please enter all of the information.'})
        }

        return Invite.findOne({})
            .where('_id').equals(inviteId)
            .where('dateDeleted').equals(null)
            .exec()
            .then(invite => {
                if (!invite) {
                    return res.status(500).json({error: 'unknown invite'});
                } else if (invite.accepted) {
                    return res.status(500).json({error: 'invite taken'});
                } else {

                    if (invite.email != email) {
                        // we will require the email as a sort of validation
                        return res.status(409).json({error: 'wrong email'});
                    } else {

                        let inviteTeam = util.getObjectIdAsString(invite.team),
                            role = invite.role,
                            firstName = '',
                            lastName = '';

                        if (userName) {
                            firstName = userName.substr(0, (userName+' ').indexOf(' ')).trim();
                            lastName = userName.substr((userName+' ').indexOf(' '), userName.length).trim();
                        }

                        // invite.accepted = true;
                        // invite.dateAccepted = Date.now();

                        // invite.save();

                        bcrypt.hash(password, config.saltRounds).then(hash => {
                            return User.create({
                                email: email,
                                password: hash,
                                firstName: firstName,
                                lastName: lastName
                            });
                        })
                        .then(user => {

                            if (inviteTeam) {
                                return module.exports.doAcceptInvite(user._id, inviteId, req)
                                    .then(newUser => {
                                        res.json(module.exports.prepUserObject(newUser));
                                    })
                            } else {
                                // this user was invited as a regular user
                                // TODO: this
                            }

                        }, error => {
                            console.error(error);
                            res.status(500).json({error: 'There was an error creating your account.'});
                        });

                    }

                }
            })

    },

    getAll: (req, res) => {
        User.find({}).exec()
            .then((users) => {
                res.json(users);
            });
    },

    get: (req, res) => {
        return findModelUtil.findUser(req.params.id)
            .catch(err => {
                util.handleError(req, res, err);
            })
            .then(user => {
                if (user) {
                    res.json(module.exports.prepUserObject(user));
                } else {
                    res.status(404).send('not found');
                }
            });
    },

    update: (req, res) => {
        let formData = req.body,
            password = req.body.password,
            promise,
            oldUser;

        if (password) {
            promise = bcrypt.hash(password, config.saltRounds);
        } else {
            promise = Promise.resolve();
        }
        
        promise.then(hash => {
             return findModelUtil.findUser(req.params.id, null, null)
                .then(user => {
                    oldUser = user.toObject();
                    delete oldUser.password;

                    user = util.smartUpdate(user, formData, findModelUtil.USER_WHITELIST);

                    if (hash) {
                        user.password = hash;
                    }

                    user.dateModified = Date.now();

                    return user.save((err, saved) => {
                        if (err) {
                            util.handleError(req, res, err);
                        } else {
                            let changes = util.findChanges(oldUser, saved);

                            if (hash) {
                                changes.push({
                                    property: 'password'
                                });
                            }

                            HistoryModel.create({
                                user: saved,
                                action: 'account_edit',
                                changes: changes
                            });

                            saved = module.exports.prepUserObject(saved);

                            if (res) {
                                res.json(saved);
                            }
                        }
                    });
                });
        });
    },

    delete: (req, res) => {
        User.find({})
            .where('_id').equals(req.params.id)
            .remove((err) => {
                if (err) {
                    util.handleError(req, res, err);
                } else {
                    res.send("User Deleted");
                }
            });
    },

    prepUserObject: (user) => {
        if (!user) {
            return {};
        }

        if (user.toObject) {
            user = user.toObject();
        }

        if (!user.superAdmin) {
            delete user.superAdmin;
        }
        
        // make sure the user has an active subscription
        if (user.locked) {
            user.actions = roles.getActionsForRole(roles.ROLE_LOCKED);
        } else if (user.subscription &&
                typeof(user.subscription) == 'object' &&
                (
                    user.subscription.expiration > Date.now()
                )) {

            user.actions = roles.getActionsForRole(user.subscription.role);
        } else {
            // the user is either expired or doesn't have a subscription
            user.actions = roles.getActionsForRole(roles.ROLE_USER);

            if (user.subscription && roles.getRoleType(user.subscription.role) == roles.ROLE_FACILITATOR) {
                // expired facilitator accounts should still have access to the facilitator role features, without the subscriber features
                user.actions = util.unionArrays(roles.getActionsForRole(roles.ROLE_FACILITATOR, true), user.actions);
            } else if (user.subscription && roles.getRoleType(user.subscription.role) == roles.ROLE_IMPROVISER) {
                user.actions = util.unionArrays(roles.getActionsForRole(roles.ROLE_IMPROVISER, true), user.actions);
            }
        }

        return user;
    },

    validateUser: (email, password, callback) => {
        return findModelUtil.findUser(email, 'password')
            .then(user => {
                if (user) {
                    // user = module.exports.prepUserObject(user);
                    return bcrypt.compare(password, user.password)
                        .then(res => {
                            if (res) {
                                return Promise.resolve(user);
                            } else {
                                return Promise.resolve(false);
                            }
                        });
                } else {
                    return Promise.resolve(false);
                }
            });
    },

    createUser: (data) => {
        let password = data.password,
            userData = util.smartUpdate({}, data, findModelUtil.USER_WHITELIST);

        return bcrypt.hash(password, config.saltRounds)
            .then(hash => {
                userData.password = hash;
                return User.create(userData);
            });
    },

    /**
     * Get all of a user's purchases
     */
    purchases: (req, res) => {
        return Purchase.find({})
            .where('user').equals(req.user._id)
            .populate('team packages.package materials.material')
            .exec()
            .then(p => {
                res.json(p);
            })

    },

    teams: (req, res) => {
        return User.findOne({}).where('_id').equals(req.user._id)
            .select('memberOfTeams adminOfTeams')
            .populate({
                path: 'adminOfTeams memberOfTeams',
                populate: {
                    path: 'subscription',
                    populate: {
                        path: 'invites',
                        match: { accepted: false }
                    }
                }
            })
            .populate({
                path: 'adminOfTeams memberOfTeams',
                populate: {
                    path: 'admins members',
                    select:'-password',
                    populate: {
                        path: 'subscription'
                    }
                }
            })
            .then(u => {
                res.json(u);
            })
    },

    subscription: (req, res) => {
        if (req.method == 'GET') {
            return User.findOne({}).where('_id').equals(req.user._id)
                .select('subscription')
                .populate({
                    path: 'subscription',
                    populate: {
                        path: 'parent',
                        populate: {
                            path: 'team',
                            select: 'name'
                        }
                    }
                })
                .then(u => {
                    let user = u.toObject();

                    if (user.subscription) {
                        user.subscription.roleName = roles.findRoleById(user.subscription.role).name;
                    }

                    res.json(user);
                })
        } else {
            return util.notfound(req, res);
        }
    },

    pledge: (req, res) => {
        let stripe = require('stripe')(config.stripe.secret),

            userId = req.user._id,
            stripeToken = req.body.stripeToken,
            token,

            newPledgeInput = req.body.pledge || 0,
            newPledge = parseFloat(newPledgeInput),
            newPledgeString = newPledge.toFixed(2);

        if (typeof stripeToken == 'object' && stripeToken.id) {
            token = stripeToken.id;
        }

        return Subscription.findOne({})
            .where('user').equals(userId)
            .exec()
            .then(sub => {
                let stripeSubscriptionId = sub.stripeSubscriptionId,
                    stripeCustomerId = sub.stripeCustomerId,
                    planId = 'pledge-' + newPledgeString;

                sub.pledge = newPledge;

                if (newPledge > 0) {
                    // we can update (or create) their subscription

                    return chargeApi.createPledgeSubscription(newPledge, token, stripeCustomerId, stripeSubscriptionId)
                        .then(stripeSub => {
                            sub.stripeSubscriptionId = stripeSub.id;
                            return sub.save();
                        });

                } else {
                    // discontinue their subscription, if necessary
                    
                    return chargeApi.cancelPledgeSubscription(stripeSubscriptionId)
                        .then(() => {
                            sub.stripeSubscriptionId = null;

                            return sub.save();
                        });

                }
            })
            .then(sub => {
                res.json(sub);
            })
    },

    leaveTeam: (req, res) => {
        if (req.method != 'PUT') {
            return res.status(404).send('not found');
        }

        let userId = req.user._id,
            teamId = req.params.toId;

        module.exports.removeUserFromTeam(userId, teamId).then(user => {
            // store a history of this having happened
            HistoryModel.create({
                user: userId,
                action: 'team_leave',
                target: teamId
            });

            res.json(module.exports.prepUserObject(user));
        }, error => {
            if (error == 404) {
                util.notfound(req, res);
            } else {
                util.handleError(error);
            }
        });

    },

    removeUserFromTeam: (userId, teamId, returnTeam) => {

        return findModelUtil.findUser(userId)
            .then(user => {

                if (util.indexOfObjectId(user.adminOfTeams, teamId) == -1 && util.indexOfObjectId(user.memberOfTeams, teamId) == -1) {
                    // how can a user leave a team they aren't in?
                    return Promise.reject(404);
                }

                return findModelUtil.findTeam(teamId)
                    .then(team => {

                        if (team && user.subscription.parent && user.subscription.parent.toString() == team.subscription.toString()) {
                            // the user inherited their subscription from the team, which means we have to revoke their subscription
                            return Subscription.findOne({}).where('_id').equals(user.subscription.parent).exec()
                                .then(parentSubscription => {
                                    parentSubscription.children = util.removeFromObjectIdArray(parentSubscription.children, user.subscription._id);
                                    return parentSubscription.save();
                                })
                                .then(() => {
                                    return Subscription.findOne({}).where('_id').equals(user.subscription._id).exec();
                                })
                                .then(userSubscription => {
                                    userSubscription.remove();

                                    user.subscription = null;
                                    return user.save();
                                })
                                .then(() => {
                                    return Promise.resolve(team);
                                });
                        } else {
                            return Promise.resolve(team);
                        }

                    })
                    .then(team => {

                        // remove the user from team
                        if (team) {
                            team.members = util.removeFromObjectIdArray(team.members, userId);
                            team.admins = util.removeFromObjectIdArray(team.admins, userId);

                            return team.save();
                        } else {
                            return Promise.resolve(team);
                        }

                    })
                    .then(team => {

                        // remove the team from the user
                        if (team) {
                            user.memberOfTeams = util.removeFromObjectIdArray(user.memberOfTeams, teamId);
                            user.adminOfTeams = util.removeFromObjectIdArray(user.adminOfTeams, teamId);
                        }

                        if (returnTeam) {
                            return user.save().then(() => {
                                return Promise.resolve(team);
                            });
                        } else {
                            return user.save();
                        }

                    })
            })
    },

    /**
     * PUT: /api/user/userId/acceptInvitation/inviteId will accept an invitation for an existing user
     */
    acceptInvite: (req, res) => {
        if (req.method != 'PUT') {
            res.status(404).send('not found');
            return;
        }

        let userId = req.params.id,
            inviteId = req.params.toId;

        module.exports.doAcceptInvite(userId, inviteId, req)
            .then(newUser => {
                res.json(module.exports.prepUserObject(newUser));
            }, error => {
                if (error == 'unauthorized') {
                    util.unauthorized(req, res);
                } else if (error.status && error.message) {
                    res.status(error.status).send(error.message);
                } else {
                    console.error(error);
                    res.status(500).send('error');
                }
            })
    },

    doAcceptInvite: (userId, inviteId, req) => {

        let user, roleId;

        return findModelUtil.findUser(userId)
            .then(u => {
                user = u;
                return Invite.findOne({})
                    .where('_id').equals(inviteId)
                    .where('dateDeleted').equals(null)
                    .exec();
            })
            .then(invite => {
                if (!invite || !user) {
                    return Promise.reject({
                        status: '404',
                        message: 'not found'
                    });
                } else if (invite.email != user.email) {
                    return Promise.reject('unauthorized');
                } else {
                    // collect this for later
                    roleId = invite.role;

                    //check the invite role against the user to make sure they are the same type
                    if (user.subscription && roles.getRoleType(roleId) != roles.ROLE_NOBODY && roles.getRoleType(user.subscription.role) !== roles.getRoleType(roleId)) {
                        return Promise.reject({
                            status: 500,
                            message: 'user type mismatch'
                        });
                    }

                    invite.accepted = true;
                    invite.dateAccepted = Date.now();

                    return invite.save();
                }
            })
            .then(invite => {
                if (invite && invite.team) {
                    return findModelUtil.findTeam(invite.team.toString());
                }
            })
            .then(team => {
                if (team) {
                    team.members = util.addToObjectIdArray(team.members, user._id);
                    return team.save();
                }
            })
            .then(team => {
                if (team) {
                    user.memberOfTeams = util.addToObjectIdArray(user.memberOfTeams, team._id);
                    user.invites = util.removeFromObjectIdArray(user.invites, inviteId);

                    HistoryModel.create({
                        user: userId,
                        action: 'team_join',
                        target: team._id
                    });

                    let needsSubscription = !user.subscription || user.subscription.expiration < Date.now();

                    module.exports.sendUserJoinedTeamEmail(team.admins, user, needsSubscription, team.name, team._id, req);

                    if (needsSubscription) {
                        return Subscription.findOne({})
                            .where('_id').equals(util.getObjectIdAsString(team.subscription))
                            .exec()
                            .then(teamSubscription => {
                                return teamSubscription.createChildSubscription(user);
                            })
                            .then(() => {
                                return findModelUtil.findUser(user._id);
                            });
                    } else if (roles.getRoleType(roleId) == roles.getRoleType(user.subscription.role) && roleId > user.subscription.role) {
                        // upgrade the user's subscription role to the team's (a team subscription is one higher than the user version)
                        return user.setSubscriptionRole(roleId);
                    } else {
                        return user.save();
                    }
                }
            });

    },

    backup: (req, res) => {
        User.find({}).exec().then(u => {
            res.json(u);
        });
    },

    validate: (req, res) => {
        let email = req.body.email,
            loggedInUser = req.user._id;

        let promise = User.findOne({}).where('email').equals(email);

        if (loggedInUser) {
            promise.where('_id').ne(loggedInUser);
        }
        
        return promise.exec()
            .then(u => {
                if (u) {
                    res.json({
                        conflict: 'email'
                    });
                } else {
                    res.json({});
                }
            });
    },

    // POST: /api/user/:_id/preference
    preference: (req, res) => {
        let userId = req.user._id,
            prefKey = req.body.key,
            prefVal = req.body.val;

        return User.findOne({})
            .where('_id').equals(userId.toString())
            .exec()
            .then(user => {
                return user.setPreference(prefKey, prefVal);
            }).then(user => {
                return findModelUtil.findUser(userId);
            }).then(user => {
                res.json(module.exports.prepUserObject(user));
            });

    },

    doesUserOwn: (user, materialId, packageId) => {
        let itemKey = materialId ? 'materials' : 'packages',
            searchId = materialId ? materialId : packageId;

        return module.exports.collectMaterials(User.findOne({}).where('_id').equals(user._id.toString()))
            .then(usersStuff => {
                if (util.indexOfObjectId(usersStuff[itemKey], searchId) > -1) {
                    // the user owns this item directly - woohoo!
                    return Promise.resolve(true);
                } else {
                    let teamIds = util.unionArrays(user.memberOfTeams, user.adminOfTeams),
                        checkTeamStuff = index => {
                            return module.exports.collectMaterials(Team.findOne({}).where('_id').equals(teamIds[index].toString()))
                                .then(stuff => {
                                    if (util.indexOfObjectId(stuff[itemKey], searchId) > -1) {
                                        // this team owns the item! hooray!
                                        return Promise.resolve(true);
                                    } else {
                                        // move on to the next one
                                        index++;
                                        if (teamIds[index]) {
                                            return checkTeamStuff(index);
                                        } else {
                                            return Promise.resolve(false);
                                        }
                                    }
                                })
                        }

                    return checkTeamStuff(0);
                }
            });
    },

    sendUserJoinedTeamEmail: (toUsers, newUser, usedSubscription, teamName, teamId, req) => {

        let newUserName = newUser.fullName ? ', one ' + newUser.fullName + ', ' : '';

        let body = `
            <p>A user${newUserName} has joined your team, ${teamName}! You don't necessarily need to do anything, but we're just letting you know.</p>
        `;

        if (usedSubscription) {
            body += `
                <p>They will utilize one of the User Subscriptions on your Team. To see details about your team (including how many subscriptions you have left), visit the ImprovPlus app.</p>
            `
        }

        toUsers.forEach(toUser => {

            let toUserName = !toUser.simpleName || toUser.simpleName == 'undefined' ? 'ImprovPlus User' : toUser.simpleName;

            let sendObject = {
                to: toUser.email,
                toName: toUserName,
                subject: 'User has joined your Team',
                content: {
                    type: 'text',
                    baseUrl: 'https://' + req.get('host'),
                    greeting: 'Hey ' + toUserName + ',',
                    body: body,
                    action: 'https://' + req.get('host') + '/app/team/' + teamId,
                    actionText: 'View Team Details'
                }
            }

            emailUtil.send(sendObject, (error, response) => {
                if (error) {
                    console.error(error);
                }
            })

        });

    }

}