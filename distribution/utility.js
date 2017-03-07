'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.defaults');

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require('winston/lib/winston/config');

var _config2 = _interopRequireDefault(_config);

var _stackTrace = require('stack-trace');

var _stackTrace2 = _interopRequireDefault(_stackTrace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logLevels = {
    levels: {
        error: 0,
        warning: 1,
        info: 2,
        debug: 3,
        verbose: 4
    }, colors: {
        error: 'red',
        warning: 'yellow',
        info: 'white',
        debug: 'green',
        verbose: 'gray'
    }
};

var logFormatter = function logFormatter(options) {

    var message = options.message || "";
    var metaString = function (meta) {

        var result;
        if (meta && Object.keys(meta).length > 0) {
            result = "\n\t" + JSON.stringify(meta, null, 2);
        } else {
            result = "";
        }
        return result;
    }(options.meta);

    var stack = getStack(10);

    var fileLocation = undefined;
    var functionLocation = undefined;
    if (stack.length > 0) {
        var callSite = stack[0];
        fileLocation = callSite.getFileName();
        if (callSite.getLineNumber()) {
            fileLocation = fileLocation + ":" + callSite.getLineNumber();
        }
        functionLocation = callSite.getFunctionName();
    }

    return [options.timestamp(), options.level.toUpperCase(), fileLocation, functionLocation, message /*,
                                                                                                      metaString*/
    ].join(" ▶ ");
};

var logColorFormatter = function logColorFormatter(options) {

    // Workaround until fixed in winston 2.0
    // https://github.com/winstonjs/winston/issues/603
    return _config2.default.colorize(options.level, logFormatter(options));
};

var transportOptions = {
    default: {
        timestamp: function timestamp() {
            return new Date().toISOString();
        }
    },

    createSpecific: function createSpecific(options) {
        return (0, _lodash2.default)(options, this.default);
    },
    createConsole: function createConsole(overrideLevel) {

        var level = undefined;
        if (overrideLevel) {
            level = overrideLevel;
        } else {
            level = 'info';
        }
        return this.createSpecific({
            name: "console",
            level: level,
            colorize: true,
            handleExceptions: true,
            formatter: logColorFormatter
        });
    },
    createFile: function createFile(outputFolderPath, outputFileName) {
        return this.createSpecific({
            name: "file",
            level: 'verbose',
            filename: outputFolderPath + "/" + outputFileName + ".log",
            json: false,
            colorize: false,
            formatter: logColorFormatter
        });
    },
    createJSONFile: function createJSONFile(outputFolderPath, outputFileName) {
        return this.createSpecific({
            name: "jsonFile",
            level: 'verbose',
            filename: outputFolderPath + "/" + outputFileName + ".log.json",
            json: true,
            colorize: false,
            formatter: logColorFormatter
        });
    }
};

// Suggestion from http://stackoverflow.com/a/27074218
var getStack = function getStack(removeLevels) {
    if (removeLevels < 0) {
        removeLevels = 0;
    }
    removeLevels = removeLevels + 1; // account for our current location

    var fullStack = _stackTrace2.default.get();

    var adjustedStack = fullStack;
    for (var count = 0; count < removeLevels; count++) {
        adjustedStack.shift();
    }

    return adjustedStack;
};

exports.default = {
    logLevels: logLevels,
    logFormatter: logFormatter,
    logColorFormatter: logColorFormatter,

    transportOptions: transportOptions,

    getStack: getStack
};