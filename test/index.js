/* @flow */

var mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
var assert = require('assert');

var Logger = require('../dist/index.js').default;

describe('Logger', function() {
    describe('#sharedInstance()', function() {
        it('shouldn\'t return an instance before set up', function() {
            const testResult = Logger.sharedInstance();
            assert(testResult === undefined);
        });

        var currentInstance;

        it('setup should return a new instance', function() {
            const name = "Test";

            const testResult = Logger.setupSharedInstance({
                name: name,
                appVersion: "X.X.X",
                consoleLevel: 'verbose',

                outputFolder: undefined,
                outputFileName: undefined,
                exitOnError: false
            });
            assert(testResult !== undefined);
            assert(testResult.name === name);

            currentInstance = testResult;
        });

        it('should return the current instance', function() {
            const testResult = Logger.sharedInstance();
            assert(testResult !== undefined);
            assert(testResult === currentInstance);
        });
    });
});
