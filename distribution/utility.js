'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getStack = exports.LogColorFormatter = exports.LogFormatter = exports.LogLevelsInformation = exports.LogLevelColors = exports.LogLevels = undefined;

var _config = require('winston/lib/winston/config');

var _config2 = _interopRequireDefault(_config);

var _stackTrace = require('stack-trace');

var _stackTrace2 = _interopRequireDefault(_stackTrace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LogLevels = exports.LogLevels = {
    error: 0,
    warning: 1,
    info: 2,
    debug: 3,
    verbose: 4
};

var LogLevelColors = exports.LogLevelColors = {
    error: 'red',
    warning: 'yellow',
    info: 'white',
    debug: 'green',
    verbose: 'gray'
};

var LogLevelsInformation = exports.LogLevelsInformation = {
    levels: LogLevels,
    colors: LogLevelColors
};

var LogFormatter = exports.LogFormatter = function LogFormatter(options) {

    var message = options.message || "";
    // const metaString = (meta => {
    //
    //     var result;
    //     if (meta && Object.keys(meta).length > 0) {
    //         result = "\n\t" + JSON.stringify(meta, null, 2);
    //     } else {
    //         result = "";
    //     }
    //     return result;
    //
    // })(options.meta);

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

var LogColorFormatter = exports.LogColorFormatter = function LogColorFormatter(options) {

    // Workaround until fixed in winston 2.0
    // https://github.com/winstonjs/winston/issues/603
    return _config2.default.colorize(options.level, LogFormatter(options));
};

// Suggestion from http://stackoverflow.com/a/27074218
var getStack = exports.getStack = function getStack(removeLevels) {
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
    LogLevelsInformation: LogLevelsInformation,
    LogFormatter: LogFormatter,
    LogColorFormatter: LogColorFormatter,

    getStack: getStack
};