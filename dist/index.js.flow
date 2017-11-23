/* @flow */

import winston from 'winston';

import { LogLevels, LogLevelColors} from './utility';
import type { LogLevel } from './utility';
export type { LogLevel };

import TransportOptions from './transportOptions';
import type { Options as TransportOptionsOptions } from './transportOptions';

import defaults from 'lodash.defaults';

import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';

type Config = {
    name: string;

    appVersion: ?string;

    consoleLevel: LogLevel;

    outputFolder: ?string;
    outputFileName: ?string;

    exitOnError: ?boolean;
};

export class Logger {
    static _sharedInstance: Logger;

    config: Config;

    transports: Array<any>;

    internalLogger: winston.Logger;

    static get DefaultConfig(): Config {
        return {
            name: '?',

            appVersion: undefined,

            consoleLevel: 'info',

            outputFolder: undefined,
            outputFileName: undefined,

            exitOnError: false
        }
    }

    constructor(config: Config, writeStartup: ?boolean) {

        this.config = defaults(config, Logger.DefaultConfig);

        this.transports = [];

        let loggingToDisplayNames = [];

        const consoleOptions = TransportOptions.createConsole(config.consoleLevel);
        const addedConsoleMessage = this.createAndAddTransport(winston.transports.Console, consoleOptions);
        loggingToDisplayNames.push(addedConsoleMessage);

        if (this.outputFolder) {
            const outputFolder = this.outputFolder;

            var outputFolderPath = path.resolve(process.cwd(), outputFolder);

            try {
                fs.statSync(outputFolderPath)
            } catch(error) {
                mkdirp.sync(outputFolderPath)
            }

            // TODO: rename previous log file
            const fileOptions = TransportOptions.createFile(outputFolderPath, this.outputFileName);
            const addedFileMessage = this.createAndAddTransport(winston.transports.File, fileOptions);
            loggingToDisplayNames.push(addedFileMessage);

            // TODO: rename previous log file
            const jsonFileOptions = TransportOptions.createJSONFile(outputFolderPath, this.outputFileName);
            const addedJsonFileMessage = this.createAndAddTransport(winston.transports.File, jsonFileOptions);
            loggingToDisplayNames.push(addedJsonFileMessage);
        }

        this.internalLogger = new (winston.Logger)({
            levels: LogLevels,
            colors: LogLevelColors,
            transports: this.transports,
            exitOnError: config.exitOnError
        });

        winston.addColors(LogLevelColors);

        if (writeStartup) {
            this.writeStartup();
        }

        if (!config || !config.outputFolder) {
            this.warning("No log output folder specified, only logging to console.");
        }

        this.debug("Logging to:\n" + loggingToDisplayNames.map(name => { return "'" + name + "'"; }).join("\n"));
    }

    get name(): string {
        const { name } = this.config;
        return name;
    }

    get appVersion(): string {
        const { appVersion } = this.config;

        if (!appVersion) {
            return "";
        }

        return appVersion;
    }

    get outputFolder(): ?string {
        const { outputFolder } = this.config;
        return outputFolder;
    }

    get outputFileName(): string {
        const { outputFileName } = this.config;

        if (!outputFileName) {
            return this.name;
        }

        return outputFileName;
    }

    createAndAddTransport(transportClass: Class<any>, options: TransportOptionsOptions): string {
        this.transports.push(new (transportClass) (options));

        let name = undefined;
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

    static setupSharedInstance(config: Config, writeStartup: ?boolean): Logger {
        if (!Logger._sharedInstance) {
            Logger._sharedInstance = new Logger(config, writeStartup);
        } else {
            Logger._sharedInstance.error("Skipping attempt to create additional Logger");
        }

        return Logger._sharedInstance;
    }

    // TODO: change to get property
    static sharedInstance(): Logger {
        return Logger._sharedInstance;
    }

    error(...args: Array<any>) {
        args.unshift("error");

        this.internalLogger.log.apply(this.internalLogger, args);
    }

    warning(...args: Array<any>) {
        args.unshift("warning");

        this.internalLogger.log.apply(this.internalLogger, args);
    }

    info(...args: Array<any>) {
        args.unshift("info");

        this.internalLogger.log.apply(this.internalLogger, args);
    }

    debug(...args: Array<any>) {
        args.unshift("debug");

        this.internalLogger.log.apply(this.internalLogger, args);
    }

    verbose(...args: Array<any>) {
        args.unshift("verbose");

        this.internalLogger.log.apply(this.internalLogger, args);
    }

    // TODO: optionally specify level
    writeStartup() {
        this.info("--------------")
        this.info(this.name, this.appVersion);
        this.info("--------------")
    }
}

export default {
    setupSharedInstance: Logger.setupSharedInstance,
    sharedInstance: Logger.sharedInstance
}
