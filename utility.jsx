import defaults from 'lodash.defaults';

import winstonConfig from 'winston/lib/winston/config';

import stackTrace from 'stack-trace';

const logLevels = {
    levels: {
        error : 0,
        warning : 1,
        info : 2,
        debug : 3,
        verbose : 4
    }, colors: {
        error: 'red',
        warning: 'yellow',
        info: 'white',
        debug: 'green',
        verbose: 'gray'
    }
};

const logFormatter = (options) => {

    const message = options.message || "";
    const metaString = (meta => {

        var result;
        if (meta && Object.keys(meta).length > 0) {
            result = "\n\t" + JSON.stringify(meta, null, 2);
        } else {
            result = "";
        }
        return result;

    })(options.meta);

    const stack = getStack(10);

    let fileLocation = undefined;
    let functionLocation = undefined;
    if (stack.length > 0) {
        const callSite = stack[0];
        fileLocation = callSite.getFileName();
        if (callSite.getLineNumber()) {
            fileLocation = fileLocation + ":" + callSite.getLineNumber();
        }
        functionLocation = callSite.getFunctionName();
    }

    return [
        options.timestamp(),
        options.level.toUpperCase(), 
        fileLocation,
        functionLocation,
        message/*,
        metaString*/
    ].join(" ▶ ");
};

const logColorFormatter = (options) => {

    // Workaround until fixed in winston 2.0
    // https://github.com/winstonjs/winston/issues/603
    return winstonConfig.colorize(options.level, logFormatter(options));
};

const transportOptions = {
    default: {
        timestamp: function() { return (new Date ()).toISOString(); }
    },

    createSpecific(options) {
        return defaults(options, this.default);
    },

    createConsole(overrideLevel) {

        let level = undefined;
        if (overrideLevel) {
            level = overrideLevel;
        } else {
            level = 'info';
        }
        return this.createSpecific({
            name: "console",
            level,
            colorize: true,
            handleExceptions: true,
            formatter: logColorFormatter
        });
    },

    createFile(outputFolderPath, outputFileName) {
        return this.createSpecific({ 
            name: "file",
            level: 'verbose',
            filename: outputFolderPath + "/" + outputFileName + ".log",
            json: false,
            colorize: false,
            formatter: logColorFormatter
        });
    },

    createJSONFile(outputFolderPath, outputFileName) {
        return this.createSpecific({
            name: "jsonFile",
            level: 'verbose',
            filename: outputFolderPath + "/" + outputFileName + ".log.json",
            json: true,
            colorize: false,
            formatter: logColorFormatter
        })
    }
};

// Suggestion from http://stackoverflow.com/a/27074218
const getStack = (removeLevels) => {
    if (removeLevels < 0) {
        removeLevels = 0;
    }
    removeLevels = removeLevels + 1; // account for our current location

    const fullStack = stackTrace.get();

    let adjustedStack = fullStack;
    for (let count = 0; count < removeLevels; count ++) {
        adjustedStack.shift();
    }

    return adjustedStack;
}

export default {
    logLevels,
    logFormatter,
    logColorFormatter,

    transportOptions,

    getStack
};