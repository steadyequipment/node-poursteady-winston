'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _winstonCloudwatch = require('winston-cloudwatch');

var _winstonCloudwatch2 = _interopRequireDefault(_winstonCloudwatch);

var _utility = require('./utility');

var _utility2 = _interopRequireDefault(_utility);

var _lodash = require('lodash.isfunction');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.isboolean');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.defaults');

var _lodash6 = _interopRequireDefault(_lodash5);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 2016-03-30T10:29:32.686-04:00 NOTICE logging.js:223 logFormatter ▶ Blah
// TODO: function
// TODO: file?
// TODO: coloring

// TODO: better cloudwatchTransportOptionsify getting shared instance rather than new for all imports

var Logger = function () {

    ///
    // config : {
    //  consoleLevel : string (verbose, debug, info, warning, error),
    //  outputFolder : string,  
    //  outputFileName : string
    // }
    function Logger(config, cloudwatchOptions /*optional*/, writeStartup) {
        _classCallCheck(this, Logger);

        if ((0, _lodash4.default)(cloudwatchOptions)) {

            writeStartup = cloudwatchOptions;
            cloudwatchOptions = undefined;
        }

        this.config = (0, _lodash6.default)({
            consoleLevel: "info"
        }, config);

        this.winstonCloudwatchMissingCredentialsSpam = false;

        this.transports = [];

        var loggingToDisplayNames = [];

        var consoleOptions = _utility2.default.transportOptions.createConsole(config.consoleLevel);
        var addedConsoleMessage = this.createAndAddTransport(_winston2.default.transports.Console, consoleOptions);
        loggingToDisplayNames.push(addedConsoleMessage);

        if (this.outputFolder) {

            var outputFolderPath = _path2.default.resolve(process.cwd(), this.outputFolder);

            try {
                _fs2.default.statSync(outputFolderPath);
            } catch (error) {
                _mkdirp2.default.sync(outputFolderPath);
            }

            // TODO: rename previous log file
            var fileOptions = _utility2.default.transportOptions.createFile(outputFolderPath, this.outputFileName);
            var addedFileMessage = this.createAndAddTransport(_winston2.default.transports.File, fileOptions);
            loggingToDisplayNames.push(addedFileMessage);

            // TODO: rename previous log file
            var jsonFileOptions = _utility2.default.transportOptions.createJSONFile(outputFolderPath, this.outputFileName);
            var addedJsonFileMessage = this.createAndAddTransport(_winston2.default.transports.File, jsonFileOptions);
            loggingToDisplayNames.push(addedJsonFileMessage);
        }

        if (cloudwatchOptions && cloudwatchOptions.enabled) {

            var errorHandler = this.winstonCloudwatchErrorHandler.bind(this);

            var options = _utility2.default.transportOptions.createCloudwatch(this.name, errorHandler);
            var addedMessage = this.createAndAddTransport(_winstonCloudwatch2.default, options);
            loggingToDisplayNames.push(addedMessage);
        }

        this.internalLogger = new _winston2.default.Logger({
            levels: _utility2.default.logLevels.levels,
            colors: _utility2.default.logLevels.colors,
            transports: this.transports
        });

        _winston2.default.addColors(_utility2.default.logLevels.colors);

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
            if ((0, _lodash2.default)(options.name)) {
                name = options.name();
            } else {
                name = options.name;
            }

            if (!name) {
                name = "Added transport class '" + transportClass + "'";
            }

            return name + " <= " + options.level;
        }
    }, {
        key: 'winstonCloudwatchErrorHandler',
        value: function winstonCloudwatchErrorHandler(error) {

            if (error.message === "Missing credentials in config") {
                if (this.winstonCloudwatchMissingCredentialsSpam === true) {
                    return;
                }

                this.winstonCloudwatchMissingCredentialsSpam = true;
            }

            if (this.transports) {
                this.transports.forEach(function (transport) {
                    if (transport.name != 'CloudWatch') {
                        transport.log('error', "Cloudwatch: " + error.message, null, function () {});
                    }
                });
            } else {
                console.log("Error: Cloudwatch:", error.message);
            }
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


            if (!name) {
                return "module";
            }

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
        value: function setupSharedInstance(config, cloudwatchOptions) {
            if (!Logger._sharedInstance) {
                Logger._sharedInstance = new Logger(config, cloudwatchOptions);
            } else {
                Logger._sharedInstance.error("Skipping attempt to create additional Logger");
            }

            return Logger._sharedInstance;
        }
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