var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId;

var dbUrl = require("./config/configDB").url;
var User = require("./models/users");
var LogModels = require("./models/logModels");

passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true
    },
    function (req, email, password, done) {
        process.nextTick(function () {
            var db = mongoose.connect(dbUrl);
            User.findOne({'local.email': email, 'local.password': password}, function (err, user) {
                var newLogin = new LogModels.userLoginLog({
                    userEmail: email,
                    userIp: req._remoteAddress,
                    device: "Computer",
                    access: false
                });
                if(!user){
                    newLogin.save(function (err, log) {
                        db.disconnect();
                        return done(null, false, req.flash('loginMessage', 'Incorrect email or password'));
                    });
                }else{
                    newLogin.access = true;
                    newLogin.save(function () {
                        db.disconnect();
                        done(null, user);
                    });
                }
            });
        });
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});