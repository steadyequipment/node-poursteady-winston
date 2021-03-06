'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Logger = exports.version = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _package = require('../package.json');

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _utility = require('./utility');

var _transportOptions = require('./transportOptions');

var _transportOptions2 = _interopRequireDefault(_transportOptions);

var _lodash = require('lodash.defaults');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.version = _package.version;

var Logger = exports.Logger = function () {
    _createClass(Logger, null, [{
        key: 'DefaultConfig',
        get: function get() {
            return {
                name: '?',

                appVersion: undefined,

                consoleLevel: 'info',

                outputFolder: undefined,
                outputFileName: undefined,

                exitOnError: false
            };
        }
    }]);

    function Logger(config, writeStartup) {
        _classCallCheck(this, Logger);

        this.config = (0, _lodash2.default)(config, Logger.DefaultConfig);

        this.transports = [];

        var loggingToDisplayNames = [];

        var consoleOptions = _transportOptions2.default.createConsole(config.consoleLevel);
        var addedConsoleMessage = this.createAndAddTransport(_winston2.default.transports.Console, consoleOptions);
        loggingToDisplayNames.push(addedConsoleMessage);

        if (this.outputFolder) {
            var _outputFolder = this.outputFolder;

            var outputFolderPath = _path2.default.resolve(process.cwd(), _outputFolder);

            try {
                _fs2.default.statSync(outputFolderPath);
            } catch (error) {
                _mkdirp2.default.sync(outputFolderPath);
            }

            // TODO: rename previous log file
            var fileOptions = _transportOptions2.default.createFile(outputFolderPath, this.outputFileName);
            var addedFileMessage = this.createAndAddTransport(_winston2.default.transports.File, fileOptions);
            loggingToDisplayNames.push(addedFileMessage);

            // TODO: rename previous log file
            var jsonFileOptions = _transportOptions2.default.createJSONFile(outputFolderPath, this.outputFileName);
            var addedJsonFileMessage = this.createAndAddTransport(_winston2.default.transports.File, jsonFileOptions);
            loggingToDisplayNames.push(addedJsonFileMessage);
        }

        this.internalLogger = new _winston2.default.Logger({
            levels: _utility.LogLevels,
            colors: _utility.LogLevelColors,
            transports: this.transports,
            exitOnError: config.exitOnError
        });

        _winston2.default.addColors(_utility.LogLevelColors);

        if (writeStartup) {
            this.writeStartup();
        }

        if (!config || !config.outputFolder) {
            this.warning("No log output folder specified, only logging to console.");
        }

        this.debug("Logging to:\n" + loggingToDisplayNames.map(function (name) {
            return "'" + name + "'";
        }).join("\n"));
    }

    _createClass(Logger, [{
        key: 'createAndAddTransport',
        value: function createAndAddTransport(transportClass, options) {
            this.transports.push(new transportClass(options));

            var name = undefined;
            if (typeof options.name === 'function') {
                name = options.name();
            } else {
                name = options.name;
            }

            if (!name) {
                name = "Added transport class '" + transportClass.toString() + "'";
            }

            return name + " <= " + options.level;
        }
    }, {
        key: 'error',
        value: function error() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            args.unshift("error");

            this.internalLogger.log.apply(this.internalLogger, args);
        }
    }, {
        key: 'warning',
        value: function warning() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            args.unshift("warning");

            this.internalLogger.log.apply(this.internalLogger, args);
        }
    }, {
        key: 'info',
        value: function info() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            args.unshift("info");

            this.internalLogger.log.apply(this.internalLogger, args);
        }
    }, {
        key: 'debug',
        value: function debug() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            args.unshift("debug");

            this.internalLogger.log.apply(this.internalLogger, args);
        }
    }, {
        key: 'verbose',
        value: function verbose() {
            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                args[_key5] = arguments[_key5];
            }

            args.unshift("verbose");

            this.internalLogger.log.apply(this.internalLogger, args);
        }

        // TODO: optionally specify level

    }, {
        key: 'writeStartup',
        value: function writeStartup() {
            this.info("--------------");
            this.info(this.name, this.appVersion);
            this.info("--------------");
        }
    }, {
        key: 'name',
        get: function get() {
            var name = this.config.name;

            return name;
        }
    }, {
        key: 'appVersion',
        get: function get() {
            var appVersion = this.config.appVersion;


            if (!appVersion) {
                return "";
            }

            return appVersion;
        }
    }, {
        key: 'outputFolder',
        get: function get() {
            var outputFolder = this.config.outputFolder;

            return outputFolder;
        }
    }, {
        key: 'outputFileName',
        get: function get() {
            var outputFileName = this.config.outputFileName;


            if (!outputFileName) {
                return this.name;
            }

            return outputFileName;
        }
    }], [{
        key: 'setupSharedInstance',
        value: function setupSharedInstance(config, writeStartup) {
            if (!Logger._sharedInstance) {
                Logger._sharedInstance = new Logger(config, writeStartup);
            } else {
                Logger._sharedInstance.error("Skipping attempt to create additional Logger");
            }

            return Logger._sharedInstance;
        }

        // TODO: change to get property

    }, {
        key: 'sharedInstance',
        value: function sharedInstance() {
            return Logger._sharedInstance;
        }
    }]);

    return Logger;
}();

exports.default = {
    setupSharedInstance: Logger.setupSharedInstance,
    sharedInstance: Logger.sharedInstance
};