var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('request');

var app = require('../app');

describe("Home page", function () {

    it("Home page content", function (done) {
        request('http://localhost:3000', function (err, response, body) {
            if(err) done(err);
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
});