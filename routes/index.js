var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/joblist', function(req, res, next) {
  res.render('joblist');
});

router.get('/login-popup', function(req, res, next) {
  res.render('login-popup');
});

router.get('/register-popup', function(req, res, next) {
  res.render('register-popup');
});

router.get('/employers', function(req, res, next) {
  res.render('employers');
});

router.get('/candidates', function(req, res, next) {
  res.render('candidates');
});

router.get('/job-single', function(req, res, next) {
  res.render('job-single');
});

router.get('/employers-single', function(req, res, next) {
  res.render('employers-single');
});

router.get('/candidates-single', function(req, res, next) {
  res.render('candidates-single');
});

router.get('/faq', function(req, res, next) {
  res.render('faq');
});

router.get('/contact', function(req, res, next) {
  res.render('contact');
});





module.exports = router;
