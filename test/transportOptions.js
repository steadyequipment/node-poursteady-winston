/* @flow */

var mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
var assert = require('assert');

var TransportOptions = require('../distribution/transportOptions.js').default;

describe('TransportOptions', function() {
    describe('#createSpecific()', function() {
        it('should ensure specific default values are present', function() {
            const testResult = TransportOptions.createSpecific({});
            assert(testResult.timestamp !== undefined);
            assert(testResult.formatter !== undefined);
        });
    });

    describe('#createConsole()', function() {
        it('should ensure specific default values are present', function() {
            const logLevel = 'debug';

            const testResult = TransportOptions.createConsole(logLevel);
            assert(testResult.level !== undefined && testResult.level === logLevel);
        });
    });

    describe('#createFile()', function() {
        it('should ensure specific default values are present', function() {
            const logLevel = 'verbose';

            const testResult = TransportOptions.createFile("./logs/", "test");
            assert(testResult.level !== undefined && testResult.level === logLevel);
        });
    });

    describe('#createJSONFile()', function() {
        it('should ensure specific default values are present', function() {
            const logLevel = 'verbose';

            const testResult = TransportOptions.createFile("./logs/", "test");
            assert(testResult.level !== undefined && testResult.level === logLevel);
        });
    });
});
