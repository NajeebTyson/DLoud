var expect = require('chai').expect;
var assert = require('chai').assert;
var request = require('request');
var should = require('should');

var app = require('../../app');
var appApi = require('../../routes/appApi');

describe("Quiz", function () {

    it("should get a quiz data", function (done) {
        var quiz_id = 'helloworld';
        request('http://localhost:3000/app_api/dloud/quiz/data/'+quiz_id, function (err, response, body) {
            // expect(response.statusCode).to.equal(200);
            var content = JSON.parse(body);
            content.should.have.length(0);
            done();
        });
    });
});