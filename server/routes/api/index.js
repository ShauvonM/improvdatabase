var express = require('express');
var router = express.Router();
var util = require('../../util');

const ops     = {
        "user": require('./user.controller'),
        "game": require('./game.controller'),
        "metadata": require('./metadata.controller'),
        "name": require('./name.controller'), 
        "note": require('./note.controller'),
        "tag": require('./tag.controller'),
        "team": require('./team.controller'),
        "subscription": require('./subscription.controller'),
        "purchase": require('./purchase.controller'),
        "invite": require('./invite.controller'),
        "history": require('./history.controller')
    };

let api = {
    create: function(req, res) {
        if (ops[req.params.op]) {
            console.log("CREATE " + req.params.op);
            ops[req.params.op].create(req,res);
        } else {
            util.notfound(req, res);
        }
    },

    getAll: function(req,res) {
        if (req.params.op == 'backup') {
            require('./backup').backupAll(req, res);
        } else if (ops[req.params.op] && ops[req.params.op].getAll) {
            console.log("GET ALL " + req.params.op);
            ops[req.params.op].getAll(req,res);
        } else {
            util.notfound(req, res)
        }
    },

    getAllExpanded: function(req, res) {
        if (ops[req.params.op] && ops[req.params.op].getAllExpanded) {
            console.log("GET ALL EXPANDED" + req.params.op);
            ops[req.params.op].getAllExpanded(req,res);
        } else {
            this.getAll(req, res);
        }
    },
    get: function(req,res) {
        if (ops[req.params.op] && ops[req.params.op].get) {
            console.log("GET " + req.params.op, req.params.id);
            ops[req.params.op].get(req,res);
        } else {
            util.notfound(req, res)
        }
    },
    getExpanded: function(req, res) {
        if (ops[req.params.op] && ops[req.params.op].getExpanded) {
            console.log("GET EXPANDED" + req.params.op);
            ops[req.params.op].getExpanded(req,res);
        } else {
            this.get(req, res);
        }
    },
    update: function(req,res) {
        if (req.params.op == 'restore' && req.user.superAdmin) {
            require('../../reset').checkForSeed(true, req.body.timestamp, true).then(() => {
                res.send('done');
            });
        } else if (ops[req.params.op] && req.params.id) {
            console.log("UPDATE " + req.params.op, req.params.id);
            ops[req.params.op].update(req,res);
        } else {
            util.notfound(req, res)
        }
    },
    delete: function(req,res) {
        if (ops[req.params.op] && req.params.id) {
            console.log("DELETE " + req.params.op, req.params.id);
            ops[req.params.op].delete(req,res);
        } else {
            util.notfound(req, res)
        }
    },
    method: function(req,res) {
        if (ops[req.params.op] && ops[req.params.op][req.params.method]) {
            console.log("Method requested:", req.params.method + " ON " + req.params.op, req.params.id);
            ops[req.params.op][req.params.method](req,res);
        } else {
            util.notfound(req, res)
        }
    },

    backup: function (req, res) {
        if (ops[req.params.op] && ops[req.params.op].backup) {
            console.log('Backup data for ' + req.params.op);
            ops[req.params.op].backup(req, res);
        } else {
            util.notfound(req, res)
        }
    },

    validate: function(req, res) {
        if (ops[req.params.op] && ops[req.params.op].validate) {
            console.log('Validate data for ' + req.params.op);
            ops[req.params.op].validate(req, res);
        } else {
            util.notfound(req, res)
        }
    }
}

router.post('/:op', api.create);
router.get('/:op', api.getAll);
router.get('/:op/backup', api.backup);
router.post('/:op/validate', api.validate);
router.get('/:op/expand', api.getAllExpanded);
router.get('/:op/:id', api.get);
router.get('/:op/:id/expand', api.getExpanded);
router.put('/:op', api.update);
router.put('/:op/:id', api.update);
router.delete('/:op/:id', api.delete);
router.all('/:op/:id/:method', api.method);
router.all('/:op/:id/:method/:toId', api.method);


module.exports = router;