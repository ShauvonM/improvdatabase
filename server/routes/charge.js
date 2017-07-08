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
    roles = require('../roles'),
    PackageConfig = require('../models/packageconfig.model');

let User = require('../models/user.model'),
    Team = require('../models/team.model'),
    Purchase = require('../models/purchase.model'),
    Subscription = require('../models/subscription.model'),
    Package = require('../models/package.model'),
    HistoryModel = require('../models/history.model');


module.exports = {

    signup: (req, res) => {

        let stripe = require('stripe')(config.stripe.secret),
            
            tokenVal = req.body.stripeToken,
            pledgeInput = req.body.pledge,
            pledge = pledgeInput ? parseFloat(pledgeInput) : 0,
            pledgeString = pledge.toFixed(2),
            email = req.body.email,
            password = req.body.password,
            userName = req.body.name,
            userId,

            /**
             * Payload: {
             *  stripeToken: Stripe token (either string or object with id property)
             *  cart: Purchase[]
             *  email: string (new user's email)
             *  password: string (new user's password)
             *  teamName: string (name of the team, optional)
             * }
             */

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
                }
            })
            .then(stripeCustomer => {
                if (token) {

                    return module.exports.createPledgeSubscription(pledge, token);
                
                    // if (res.headersSent || error) {
                    //     return Promise.reject(error || 'nothing purchased');
                    // }

                    // return stripe.charges.create({
                    //     amount: pledge * 100, // stripe expects the price in cents
                    //     currency: "usd",
                    //     description: 'Signup',
                    //     customer: stripeCustomerId
                    // });
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
                return user.addSubscription(roles.ROLE_IMPROVISER, pledge, stripeCustomerId, stripeSubscriptionId);
            })
            .then(user => {

                // send the confirmation / welcome email!

                let body = `
                    <p>Thank you for signing up for the Improv Database!</p>
                    <p>Your subscription is now active. You can log into the app and browse all of our fabulous feature(s). </p>
                `;

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

                    res.json(user);

                })
            })
            .catch(error => {
                console.error('signup error!', error);
                res.status(500).json({error: error});
            })
    },

    createPledgeSubscription: function (pledgeFloat, stripeToken, stripeCustomerId, stripeSubscriptionId) {
        if (!pledgeFloat || pledgeFloat == 0) {
            return this.cancelPledgeSubscription(stripeSubscriptionId);
        }

        let stripe = require('stripe')(config.stripe.secret);

        let pledgeString = pledgeFloat.toFixed(2),
            planId = 'pledge-' + pledgeString;

        // first create a stripe customer ID, or update one if we were given one
        let p;
        if (stripeCustomerId) {
            p = stripe.customers.update(stripeCustomerId, { source: stripeToken });
        } else {
            p = stripe.customers.create({
                email: email,
                source: stripeToken
            });
        }

        // see if a plan already exists at this level
        return p
            .then(customer => {
                stripeCustomerId = customer.id;
                return stripe.plans.retrieve(planId);
            })
            .catch(error => {
                if (error.type == 'StripeInvalidRequestError') {
                    return stripe.plans.create({
                        id: planId,
                        amount: pledgeFloat * 100, // stripe expects price in cents
                        interval: 'month',
                        name: 'Improv Database $' + pledgeString + ' Monthly Pledge',
                        currency: 'usd'
                    });
                }
            })
            .then(plan => {
                if (plan) {
                    if (stripeSubscriptionId) {
                        return stripe.subscriptions.update(
                            stripeSubscriptionId,
                            { plan: planId }
                        );
                    } else {
                        // create a new subscription
                        return stripe.subscriptions.create({
                            customer: stripeCustomerId,
                            plan: planId
                        })
                    }
                } else {
                    return Promise.resolve();
                }
            })
    },

    cancelPledgeSubscription: function (stripeSubscriptionId) {
        if (stripeSubscriptionId) {
            let stripe = require('stripe')(config.stripe.secret);

            return stripe.subscriptions.del(stripeSubscriptionId);
        } else {
            return Promise.resolve();
        }
    }

}