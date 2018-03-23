var expect = require('chai').expect;
var assert = require('chai').assert;
var mongoose = require("mongoose");

var dbUrl = require("../../config/configDB");
var User = require('../../models/users');


describe('User', function () {
    mongoose.Promise = global.Promise;
    var db = mongoose.connect(dbUrl.url);

    after(function (done) {
        db.disconnect();
        done();
    });

    it("should insert a new user", function (done) {
        var newUser = new User({
            local: {
                name: {
                    first : 'Jon',
                    last : 'Doe'
                },
                username: 'jon.doe',
                email: 'jon.doe@gmail.com',
                password: 'iamjondoe',
                userType: 'user'
            },
            area: 'Punjab',
            projects: []
        });
        newUser.save(function (err, user) {
            if(err) return done(err);
            assert.equal(newUser, user);
            done();
        });
    });
    
    it("should find a user", function (done) {
        User.find({'local.email': 'jon.doe@gmail.com'}, function (err, user) {
            if(err) return done(err);
            expect(user).to.be.length(1);
            assert(user[0].local.name.first, 'Jon');
            done();
        });
    });
});