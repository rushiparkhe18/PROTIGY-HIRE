var express = require('express');
var router = express.Router();

const userModel = require('./users');
const passport = require('passport')

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/joblist', function (req, res, next) {
  res.render('joblist');
});

router.get('/login', function (req, res, next) {
  res.render('login', {error: req.flash('error')});
});

router.get('/register', function (req, res, next) {
  res.render('register', {message: req.flash('error')});
});

router.get('/employers', function (req, res, next) {
  res.render('employers');
});

router.get('/candidates', function (req, res, next) {
  res.render('candidates');
});

router.get('/job-single', function (req, res, next) {
  res.render('job-single');
});

router.get('/employers-single', function (req, res, next) {
  res.render('employers-single');
});

router.get('/candidates-single', function (req, res, next) {
  res.render('candidates-single');
});

router.get('/faq', function (req, res, next) {
  res.render('faq');
});

router.get('/contact', function (req, res, next) {
  res.render('contact');
});
/////////////////////////////////////////

router.get('/dashboard',isLoggedIn, function (req, res, next) {
  res.render('employer/dashboard');
});

/////////////////////////////////////////

router.post("/register", async function (req, res, next) {
  const userData = await new userModel({
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
  });
  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/dashboard");
      })
    })
})

router.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/",
  failureFlash: true
}), function (req, res) {
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

module.exports = router;
