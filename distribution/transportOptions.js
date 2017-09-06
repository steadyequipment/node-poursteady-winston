'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utility = require('./utility.jsx');

var _lodash = require('lodash.defaults');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    default: {
        timestamp: function timestamp() {
            return new Date().toISOString();
        }
    },

    createSpecific: function createSpecific(options) {
        return (0, _lodash2.default)(options, this.default);
    },
    createConsole: function createConsole(overrideLevel) {
        var level = void 0;
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
            formatter: _utility.LogColorFormatter
        });
    },
    createFile: function createFile(outputFolderPath, outputFileName) {
        return this.createSpecific({
            name: "file",
            level: 'verbose',
            filename: outputFolderPath + "/" + outputFileName + ".log",
            json: false,
            colorize: false,
            formatter: _utility.LogColorFormatter
        });
    },
    createJSONFile: function createJSONFile(outputFolderPath, outputFileName) {
        return this.createSpecific({
            name: "jsonFile",
            level: 'verbose',
            filename: outputFolderPath + "/" + outputFileName + ".log.json",
            json: true,
            colorize: false,
            formatter: _utility.LogColorFormatter
        });
    }
};