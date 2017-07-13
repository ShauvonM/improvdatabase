const   jwt = require('jwt-simple'),
        findModelUtil = require('./routes/api/find-model.util'),
        userApi = require('./routes/api/user.controller'),
        roles = require('./roles'),
        util = require('./util'),
        config  = require('./config')(),
        url = require('url'),
        bcrypt = require('bcrypt'),
        emailUtil = require('./email'),
        HistoryModel = require('./models/history.model'),
        bluebird = require('bluebird'),
        redis   = require('redis');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

let client;
if (config.redis.url) {
    var redisUrl = url.parse(config.redis.url);
    client = redis.createClient(redisUrl.port, redisUrl.hostname, {no_ready_check: true});
    client.auth(redisUrl.auth.split(':')[1]);
} else {
    client = redis.createClient();
}

module.exports = {

    login: (req, res) => {
        var email = req.body.email || '';
        var password = req.body.password || '';

        if (email === '' || password === '') {
            module.exports.invalid(req, res);
            return;
        }

        // Fire a query to your DB and check if the credentials are valid
        userApi.validateUser(email, password)
            .then(user => {
                if (user) {
                    user.dateLoggedIn = Date.now();
                    return user.save();
                } else {
                    module.exports.invalid(req, res);
                    return Promise.resolve(false);
                }
            })
            .then(user => {
                if (user) {
                    HistoryModel.create({
                        user: user._id,
                        action: 'login'
                    });

                    module.exports.genToken(userApi.prepUserObject(user)).then(token => {
                        res.status(200).json(token);
                    });
                }
            }, err => {
                util.handleError(req, res, err);
            });
    },

    recoverPassword: (req, res) => {
        let email = req.body.email,
            noUser = function() {
                res.json({ error: 'No user found'});
            }

        console.log('recover password??', email);

        if (email === '') {
            noUser();
            return;
        }

        findModelUtil.findUser(email).then(user => {

            if (!user) {
                noUser();
            } else {

                user = userApi.prepUserObject(user);

                var dateObj = new Date();
                dateObj.setHours(dateObj.getHours() + 12); // you have 12 hours to use the link

                let token = jwt.encode({
                    exp: dateObj.getTime(),
                    iss: user._id
                }, config.token);

                let name = user.firstName + ' ' + user.lastName;
                if (!name.trim()) {
                    name = 'Improv Database User';
                }

                let link = 'https://' + req.get('host') + '/resetMyPassword/' + token;

                console.log('recover password?', name, link);

                emailUtil.send({
                    to: user.email,
                    toName: user.firstName + ' ' + user.lastName,
                    subject: 'Improv Database Password Rescue',
                    content: {
                        type: 'text',
                        baseUrl: 'https://' + req.get('host'),
                        preheader: 'Did you forget your Improv Database password? We can help with that.',
                        greeting: `Dear ${name},`,
                        body: `
                            <p>So you lost your password. That's okay - it happens to the best of us. You can use the button below to change it to something else.</p>
                        `,
                        action: link,
                        actionText: 'Click here to reset your password.',
                        afterAction: `
                            <p>If that link doesn't work for whatever reason, you can point your browser directly to ${link} and make it happen.</p>
                            <p>By the way, if you didn't ask for a new password, let us know - some joker might be trying to commit some sort of hijink.</p>
                            <p>If you are still having problems, feel free to reach out to us. You can reply directly to this email.</p>

                            <p> </p>
                            <p>Sincerely,</p>

                            <p>Shauvon McGill, creator</p>
                        `
                    }
                }, (error, response) => {
                    res.send('Sent');
                })

            }

        })
    },

    checkPasswordToken: (req, res) => {
        let token = req.body.token,
            decoded = jwt.decode(token, config.token);

        if (decoded.exp > Date.now()) {
            res.json({message: "Okay"});
        } else {
            res.json({message: "Expired"});
        }
    },

    changePassword: (req, res) => {
        let token = req.body.token,
            password = req.body.password,
            decoded = jwt.decode(token, config.token),
            id = decoded.iss,
            hash;

        if (decoded.exp > Date.now()) {
            bcrypt.hash(password, config.saltRounds).then(h => {
                hash = h;
                return User.findOne({}).where('_id').equals(id).exec();
            }).then(user => {
                user.password = hash;

                return user.save((err, saved) => {
                    if (err) {
                        util.handleError(req, res, err);
                    } else {
                        saved = saved.toObject();

                        HistoryModel.create({
                            user: user._id,
                            action: 'change_password'
                        });

                        delete saved.password;
                        saved.actions = roles.getActionsForRole(saved.role);

                        if (res) {
                            res.json(saved);
                        }
                    }
                });
            });
        } else {
            res.json({message: "Expired"});
        }
    },

    invalid: (req, res) => {
        res.status(401).json({
            "status": 401,
            "message": "Invalid credentials"
        });
    },

    logout: (req, res) => {
        var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

        client.delAsync(token).then(() => {
            var decoded = jwt.decode(token, config.token);

            HistoryModel.create({
                user: decoded.iss,
                action: 'logout'
            });

            res.status(200).json({ message: 'Logout' });
        });
        
    },

    refresh: (req, res) => {
        var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

        if (!token || !req.user._id) {
            res.status(401).json({
                'status': 401,
                'message': 'Invalid Token'
            });
            return;
        }

        return findModelUtil.findUser(req.user._id)
            .then(user => {
                user.dateLoggedIn = Date.now();
                return user.save();
            })
            .then(user => {
                HistoryModel.create({
                    user: user._id,
                    action: 'refresh'
                });
                
                // create a new token
                return module.exports.genToken(userApi.prepUserObject(user), token);
            }).then(newToken => {
                res.status(200).json(newToken);
            });
    },

    /**
     * Load the supplied token, and use it to fetch the user requesting this action
     */
    checkToken: (req, res, next) => {
        var token = (req.body && req.body.access_token) ||
            (req.query && req.query.access_token) || req.headers['x-access-token'];

        // set a default 'blank' user
        req.user = {
            actions: roles.getActionsForRole(roles.ROLE_NOBODY)
        };

        if (token) {
            client.getAsync(token).then(tokenCache => {
                var decoded = jwt.decode(token, config.token);

                // first make sure the token hasn't expired
                if (decoded.exp > Date.now() && tokenCache) {
                    // now make sure the user exists
                    // The iss parameter would be the logged in user's UserID
                    findModelUtil.findUser(decoded.iss, 'stripeCustomerId')
                        .then(user => {
                            req.user = userApi.prepUserObject(user);
                            next();
                        });
                } else {
                    next();
                }
            })
        } else {
            next();
        }
    },

    unauthorized: (req, res) => {
        util.unauthorized(req, res);
    },

    /**
     * Check the user's list of actions to see if they can do what they're trying to do
     */
    checkAuth: (req, res, next) => {
        console.log("Checking auth for: " + req.url);
        const url = req.url;

        let perm = roles.canUserHave(url, req.method, req.user);

        if (!perm) {
            console.log('Auth not permitted!');
            module.exports.unauthorized(req, res);
        } else {
            next();
        }
    },

    genToken: (user, oldToken) => {
        let expires = expiresInDays(7); // one week is recommended by Auth0

        let token = jwt.encode({
            exp: expires,
            iss: user._id
        }, config.token);

        multi = client.multi();

        multi.set(token, user._id.toString());

        if (oldToken) {
            multi.del(oldToken);
        }
        
        // redis wants the expiration in seconds from now
        let tokenExpires = Math.ceil((expires - Date.now()) / 1000);
        multi.expire(token, tokenExpires); 

        return multi.execAsync().then(() => {
            // just to be safe...
            delete user.password;
            delete user.stripeCustomerId;

            return Promise.resolve({
                token: token,
                expires: expires,
                user: user
            });
        });

    }

}

function expiresInDays(days) {
    var dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + days);
    return dateObj.getTime();
}
