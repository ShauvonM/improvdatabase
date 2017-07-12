const mongoose = require('mongoose'),
    Promise = require('bluebird');

mongoose.Promise = Promise;

let config = require('../config')();

let util = require('../util'),
    emailUtil = require('../email'),
    findModelUtil = require('./api/find-model.util');

let userController = require('./api/user.controller'),
    teamController = require('./api/team.controller'),
    auth = require('../auth'),
    roles = require('../roles');

let User = require('../models/user.model'),
    Team = require('../models/team.model'),
    Purchase = require('../models/purchase.model'),
    Subscription = require('../models/subscription.model'),
    Invite = require('../models/invite.model'),
    HistoryModel = require('../models/history.model');


module.exports = {

    signup: (req, res) => {

        let stripe = require('stripe')(config.stripe.secret),

            email = req.body.email,
            password = req.body.password,
            userName = req.body.name,
            
            tokenVal = req.body.stripeToken,
            pledgeInput = req.body.pledge,

            inviteId = req.body.invite,

            pledge = pledgeInput ? parseFloat(pledgeInput) : 0,
            pledgeString = pledge.toFixed(2),

            inviteTeam,
            role = roles.ROLE_USER, // the user role defaults to USER - fancy that
            userId,
            token,
            stripeCustomerId,
            stripeSubscriptionId,
            error;

        // make sure stripe token is the actual string
        if (typeof tokenVal == 'object' && tokenVal.id) {
            token = tokenVal.id;
        }

        if (!email) {
            error = 'email';
        } else if (!password) {
            error = 'password';
        }

        if (error) {
            res.status(500).json({error: 'No ' + error});
            return;
        }

        // step 1: verify that the email address is available for a user account
        User.findOne({}).where('email').equals(email).exec()
            .then(user => {
                if (user) {
                    return Promise.reject('email already exists');
                } else if (inviteId) {
                    // if the user was invited, let's make sure everything is in order
                    return Invite.findOne({})
                        .where('_id').equals(inviteId)
                        .where('dateDeleted').equals(null)
                        .exec();
                } else {
                    return Promise.resolve();
                }
            })
            .then(invite => {
                if (!!inviteId && !!!invite) { // !!!!!
                    // if there IS an inviteID, but no Invite object was found, there's a problem-o
                    return Promise.reject('unknown invite');
                } else if (invite) {
                    if (invite.accepted) {
                        // if someone already accepted this invite, there's a problem-o
                        return Promise.reject('invite taken');
                    } else if (invite.email != email) {
                        // if the supplied email isn't what the invite was sent to, there's a problem-o
                        return Promise.reject('wrong email');
                    } else {
                        // the invite is valid, and this is the right user
                        // remember what the invite includes for later reference
                        inviteTeam = util.getObjectIdAsString(invite.team);
                        role = invite.role;

                        return Promise.resolve();
                    }
                } else {
                    return Promise.resolve();
                }
            })
            .then(() => {
                // if we have a stripe token, create a new stripe subscription for the user
                if (token) {
                    // this is a paying user, so upgrade their role to that (unless they were invited to some special role)
                    if (!role || role == roles.ROLE_USER) {
                        role = roles.ROLE_USER_PAID;
                    }
                    return userController.createPledgeSubscription(pledge, token);
                } else {
                    return Promise.resolve();
                }
            })
            .then(subscription => {

                if (subscription) {
                    // remember the customer and subscription for later
                    stripeCustomerId = subscription.customer;
                    stripeSubscriptionId = subscription.id;
                }

                // figure out the user's name
                let firstName, lastName;
                if (userName) {
                    firstName = userName.substr(0, (userName+' ').indexOf(' ')).trim();
                    lastName = userName.substr((userName+' ').indexOf(' '), userName.length).trim();
                }

                // create a new user
                let userData = {
                    email: email,
                    password: password,
                    firstName: firstName,
                    lastName: lastName
                };
                return userController.createUser(userData);

            })
            .then(user => {
                // save the subscription data to the user
                return user.addSubscription(pledge, stripeCustomerId, stripeSubscriptionId, role);
            })
            .then(user => {
                // if the invite was to a specific team, handle adding the user to that team
                if (inviteTeam) {
                    return userController.doAcceptInvite(user._id, inviteId, req);
                } else {
                    return Promise.resolve(user);
                }
            })
            .then(user => {

                // send the confirmation / welcome email!

                let body = `
                    <p>Thank you for signing up for the Improv Database!</p>
                    <p>Your subscription is now active. You can log into the app and browse all of our fabulous feature(s).</p>
                `;

                if (inviteTeam) {
                    body += `
                        <p>You were invited to join a team, which you are now officially a part of. You can check out your team and collaborate with them through the app.</p>
                    `
                }

                if (pledge) {
                    body += `
                        <p>Plus you get a bazillion thank you's for your pledge of <b>$${pledgeString} per Month</b>! Remember, you can always change that number in your account settings in the app.</p>
                    `
                }

                emailUtil.send({
                    to: user.email,
                    toName: user.firstName + ' ' + user.lastName,
                    subject: 'Welcome to the Improv Database',
                    content: {
                        type: 'text',
                        baseUrl: 'https://' + req.headers.host,
                        greeting: 'Welcome to The Improv Database!',
                        body: body,
                        action: 'https://' + req.headers.host + '/app',
                        actionText: 'Log In Now',
                        afterAction: `
                            <p>If you have any questions about how to use the app, do not hesitate to reach out to me. You can use the "Request a feature" or "Report a Bug" options in the App Menu to send your feedback, or you can respond directly to this email.</p>

                            <p>Be excellent to each other, and party on.</p>

                            <p>Sincerely,</p>

                            <p>Shauvon McGill, creator.</p>
                        `
                    }
                }, (error, response) => {

                    res.json(userController.prepUserObject(user));

                })
            })
            .catch(error => {
                console.error('signup error!', error);
                res.status(500).json({error: error});
            })
    }

}