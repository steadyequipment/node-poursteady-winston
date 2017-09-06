import winston from 'winston';
import utility from './utility';

import isFunction from 'lodash.isfunction';
import defaults from 'lodash.defaults';

import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';

// 2016-03-30T10:29:32.686-04:00 NOTICE logging.js:223 logFormatter ▶ Blah
// TODO: function
// TODO: file?
// TODO: coloring

class Logger {

    ///
    // config : {
    //  consoleLevel : string (verbose, debug, info, warning, error),
    //  outputFolder : string,
    //  outputFileName : string
    // }
    constructor(config, writeStartup) {

        this.config = defaults({
            consoleLevel: "info"
        }, config)

        this.transports = [];

        let loggingToDisplayNames = [];

        const consoleOptions = utility.transportOptions.createConsole(config.consoleLevel);
        const addedConsoleMessage = this.createAndAddTransport(winston.transports.Console, consoleOptions);
        loggingToDisplayNames.push(addedConsoleMessage);

        if (this.outputFolder) {

            var outputFolderPath = path.resolve(process.cwd(), this.outputFolder);

            try {
                fs.statSync(outputFolderPath)
            } catch(error) {
                mkdirp.sync(outputFolderPath)
            }

            // TODO: rename previous log file
            const fileOptions = utility.transportOptions.createFile(outputFolderPath, this.outputFileName);
            const addedFileMessage = this.createAndAddTransport(winston.transports.File, fileOptions);
            loggingToDisplayNames.push(addedFileMessage);

            // TODO: rename previous log file
            const jsonFileOptions = utility.transportOptions.createJSONFile(outputFolderPath, this.outputFileName);
            const addedJsonFileMessage = this.createAndAddTransport(winston.transports.File, jsonFileOptions);
            loggingToDisplayNames.push(addedJsonFileMessage);
        }

        this.internalLogger = new (winston.Logger)({
            levels: utility.logLevels.levels,
            colors: utility.logLevels.colors,
            transports: this.transports
        });

        winston.addColors(utility.logLevels.colors);

        if (writeStartup) {
            this.writeStartup();
        }

        if (!config || !config.outputFolder) {
            this.warning("No log output folder specified, only logging to console.");
        }

        this.debug("Logging to:\n" + loggingToDisplayNames.map(name => { return "'" + name + "'"; }).join("\n"));
    }

    get name() {
        const { name } = this.config;

        if (!name) {
            return "module";
        }

        return name;
    }

    get appVersion() {
        const { appVersion } = this.config;

        if (!appVersion) {
            return "";
        }

        return appVersion;
    }

    get outputFolder() {
        const { outputFolder } = this.config;
        return outputFolder;
    }

    get outputFileName() {

        const { outputFileName } = this.config;

        if (!outputFileName) {
            return this.name;
        }

        return outputFileName;
    }

    createAndAddTransport(transportClass, options) {
        this.transports.push(new (transportClass) (options));

        let name = undefined;
        if (isFunction(options.name)) {
            name = options.name();
        } else {
            name = options.name;
        }

        if (!name) {
            name = "Added transport class '" + transportClass + "'";
        }

        return name + " <= " + options.level;
    }

    static setupSharedInstance(config, writeStartup) {
        if (!Logger._sharedInstance) {
            Logger._sharedInstance = new Logger(config, writeStartup);
        } else {
            Logger._sharedInstance.error("Skipping attempt to create additional Logger");
        }

        return Logger._sharedInstance;
    }

    static sharedInstance() {
        return Logger._sharedInstance;
    }

    error(...args) {
        args.unshift("error");

        this.internalLogger.log.apply(this.internalLogger, args);
    }

    warning(...args) {
        args.unshift("warning");

        this.internalLogger.log.apply(this.internalLogger, args);
    }

    info(...args) {
        args.unshift("info");

        this.internalLogger.log.apply(this.internalLogger, args);
    }

    debug(...args) {
        args.unshift("debug");

        this.internalLogger.log.apply(this.internalLogger, args);
    }

    verbose(...args) {
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
