/* @flow */

import winstonConfig from 'winston/lib/winston/config';

import stackTrace from 'stack-trace';

export type TimestampGenerator = () => string;

export const LogLevels = {
    error : 0,
    warning : 1,
    info : 2,
    debug : 3,
    verbose : 4
};

export const LogLevelColors = {
    error: 'red',
    warning: 'yellow',
    info: 'white',
    debug: 'green',
    verbose: 'gray'
};

export const LogLevelsInformation = {
    levels: LogLevels,
    colors: LogLevelColors
};

export type LogLevel = $Keys<typeof LogLevels>;

type Options = {|
    message: ?string;
    timestamp: TimestampGenerator;
    level: LogLevel;
|};

export const LogFormatter = (options: Options) => {

    const message = options.message || "";
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

export const LogColorFormatter = (options: Options): any => {

    // Workaround until fixed in winston 2.0
    // https://github.com/winstonjs/winston/issues/603
    return winstonConfig.colorize(options.level, LogFormatter(options));
};

// Suggestion from http://stackoverflow.com/a/27074218
export const getStack = (removeLevels: number): Array<any> => {
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
    LogLevelsInformation,
    LogFormatter,
    LogColorFormatter,

    getStack
};
