var expect = require('chai').expect;
var assert = require('chai').assert;
var mongoose = require("mongoose");

var dbUrl = require("../../config/configDB");
var Quiz = require('../../models/quiz');

describe("Quiz", function () {
    before(function () {
        mongoose.Promise = global.Promise;
        var db = mongoose.connect(dbUrl.url);
    });

    after(function (done) {
        db.disconnect();
        done();
    });

    it("should insert a new quiz", function (done) {
        var newQuiz = new Quiz({
            title: "test quiz",
            ready: false,
            countQuestions: 0,
            questions: [],
            creator: {
                name: "junaid.king",
                id: "some id"
            },
            passed: [],
            failed: [],
            passedUsers: [],
            failedUsers: []
        });
        newQuiz.save(function (err, quiz) {
            if (err) done(err);
            assert.equal(newQuiz, quiz);
            done();
        });
    });

    it("should get a quiz by title", function (done) {
        Quiz.find({'title': 'test quiz'}, function (err, quiz) {
            if (err) done(err);
            expect(quiz).to.be.length(1);
            assert(quiz[0].creator.name, "junaid.king");
            done();
        });
    });
});