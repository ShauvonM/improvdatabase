const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),

      roles = require('../roles'),
      util = require('../util'),
      
      config = require('../config')();

// AUTH
var auth = require('../auth');
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.post('/refreshToken', auth.checkToken, auth.refresh);

router.post('/recoverPassword', auth.recoverPassword);
router.post('/checkPasswordToken', auth.checkPasswordToken);
router.post('/changePassword', auth.changePassword);

router.all('/api/*', auth.checkToken, auth.checkAuth);

// APP CONFIG
router.get('/config', (req, res) => {
  // ConfigModel.find({}).exec()
  //   .then(c => {
      let data = {}; //c[0].toObject();
      data.version = require('../../package.json').version;

      data.stripe = config.stripe.publishable;
      
      res.json(data);
    // })
});

// CHECKOUT PROCESS
var charge = require('./charge');
router.post('/signup', auth.checkToken, charge.signup);
// router.post('/charge', auth.checkToken, charge.doCharge);

// CONTACT
let contactRoute = require('./contact');
router.use('/api/contact', contactRoute);

//CRUD
let api = require('./api');
router.use('/api', api);


// MAIN HOME PAGE HTML
router.get('/*', function(req, res, next) {
  let template = 'index-prod'; //process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'qa' ? 'index-prod' : 'index-dev';

  res.render(template, {
       title: config.title,
       prod: process.env.NODE_ENV == 'production',
       baseHref: '/'
   });
});

module.exports = router;
