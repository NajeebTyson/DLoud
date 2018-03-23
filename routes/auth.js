var express = require("express");
var passport = require("passport");
var mongoose = require("mongoose");
// var _ = require("lodash");

var router = express.Router();
module.exports = router;

var dbUrl = require("../config/configDB");
var User = require("../models/users");
var LogModels = require("../models/logModels");

router.route("/login")
    .get(function (req, res) {
        res.render('login', {title: 'Login - DocSync', message: req.flash('loginMessage')});
        // if(req.app.get("env") === 'development') {
        //     var db = mongoose.connect(dbUrl.url);
        //     db.findOne({'local.email':'najeebus777@gmail.com', 'local.password':'najeeb'}, function (err, user) {
        //         res.logIn(user, function (err) {
        //             if(err) {return next(err);}
        //             return res.redirect('/');
        //         });
        //         db.disconnect();
        //     });
        // }
    })
    .post(passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

router.route('/mobile-login')
    .post(function (req, res) {
        var db = mongoose.connect(dbUrl.url);
        User.findOne({'local.email': req.body.username, 'local.password': req.body.password}, function (err, user) {
            var newLogin = new LogModels.userLoginLog({
                userEmail: req.body.username,
                userIp: req._remoteAddress,
                device: "Mobile",
                access: false
            });
            if(user){
                newLogin.access = true;
                newLogin.save(function () {
                    db.disconnect();
                    res.json({login: "true", user: user});
                });
            } else {
                newLogin.save(function () {
                    db.disconnect();
                    res.json({login: "false"});
                })
            }
        });
    });

router.route('/signup')
    .get(function (req, res) {
        res.render('signup', {title: 'Sign up - DocSync', message: req.flash('signupMessage') });
    })
    .post(function (req, res) {
        mongoose.Promise = global.Promise;
        var db = mongoose.connect(dbUrl.url);
        var newUser = new User({
            local: {
                name: {
                    first : req.body.firstname.toString(),
                    last : req.body.lastname.toString()
                },
                username: req.body.username.toString(),
                email: req.body.email.toString(),
                password: req.body.pass.toString(),
                userType: 'user'
            },
            area: req.body.area.toString(),
            projects: [
                /*{
                    name: "DLoud",
                    admin: false
                }*/
            ]
        });
        newUser.save(function (err, user) {
            if(err && !user){
                // done(null, false, req.flash('signupMessage', 'Username or Email already taken'));
            }
            // done(null, user);
            res.redirect("/");
            db.disconnect();
        });
    });

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});