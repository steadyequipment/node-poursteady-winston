/* @flow */

import { LogColorFormatter } from './utility';
import type { LogLevel, TimestampGenerator } from './utility';

import defaults from 'lodash.defaults';

export type Options = {
    name: string | () => string;
    level: LogLevel;
    colorize: boolean;
    handleExceptions: true;
    timestamp: TimestampGenerator;
    formatter: Object;
};

export default {
    default: {
        timestamp: function() { return (new Date ()).toISOString(); },
        formatter: LogColorFormatter
    },

    createSpecific(options: Options): Options {
        return defaults(options, this.default);
    },

    createConsole(overrideLevel: LogLevel): Options {
        let level: LogLevel;
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
        });
    },

    createFile(outputFolderPath: string, outputFileName: string): Options  {
        return this.createSpecific({
            name: "file",
            level: 'verbose',
            filename: outputFolderPath + "/" + outputFileName + ".log",
            json: false,
            colorize: false
        });
    },

    createJSONFile(outputFolderPath: string, outputFileName: string): Options {
        return this.createSpecific({
            name: "jsonFile",
            level: 'verbose',
            filename: outputFolderPath + "/" + outputFileName + ".log.json",
            json: true,
            colorize: false
        })
    }
};
