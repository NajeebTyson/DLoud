var expect = require('chai').expect;
var assert = require('chai').assert;
var mongoose = require("mongoose");

var dbUrl = require("../../config/configDB");
var Drive = require('../../models/drive');


describe('User', function () {
    mongoose.Promise = global.Promise;
    var db = mongoose.connect(dbUrl.url);

    after(function (done) {
        db.disconnect();
        done();
    });

    it("should insert a new file", function (done) {
        var newFile = new Drive({
            name: "test file",
            shortname: "test.file",
            fType: ".txt",
            parent: "",
            childs: "",
            creator: "Najeeb",
            data: {
                content: Buffer("This is new file"),
                contentType: "Hello world"
            },
            restricted: []

        });
        newFile.save(function (err, testfile) {
            if(err) done(err);
            assert.equal(newFile, testfile);
            done();
        });
    });

    it("should get the file from database", function (done) {
        Drive.find({shortname: 'test.file'}, function (err, testfile) {
            if(err) done(err);
            assert.equal(testfile[0].creator, "Najeeb");
            done();
        });
    });
});