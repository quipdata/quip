// To run unit tests, run the following command from QuipData's base
// note it won't work if mocha wasn't installed globally
// mocha -u tdd -R spec qa/tests-unit.js

var fortune = require('../lib/fortune.js');
var expect = require('chai').expect;

suite('Fortune cookie tests', function() {
	test ('getFortune() should return a fortune', function() {
		expect(fortune.getFortune()).to.be.a('string');
	});
});