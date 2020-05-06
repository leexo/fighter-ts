"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline_1 = __importDefault(require("readline"));
var readline_sync_1 = __importDefault(require("readline-sync"));
var Messages_json_1 = __importDefault(require("./Messages.json"));
var IOManager = /** @class */ (function () {
    function IOManager(mode) {
        /*if(mode === IOMode.CONSOLE)
        { */
        var _this = this;
        this.mode = IOMode.CONSOLE;
        this.newLine = function () { return _this.output(); };
        this.outputFormat = function (s) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var ind = s.indexOf(Messages_json_1.default.variable_identifier);
            var i = 0;
            while (ind !== -1 && i < args.length) {
                s = s.replace(Messages_json_1.default.variable_identifier, args[i]);
                ind = s.indexOf(Messages_json_1.default.variable_identifier);
                i++;
            }
            _this.output(s);
        };
        this.output = console.log;
        this.clear = clearConsole;
        this.input = inputConsole;
        this.inputKey = inputKeyConsole;
        this.inputInt = inputNumConsole(false);
        this.inputFloat = inputNumConsole(true);
        this.inputYN = inputYNConsole;
        this.inputChoose = inputChooseConsole;
        // }
    }
    return IOManager;
}());
exports.default = IOManager;
var clearConsole = console.clear;
var formatQuery = function (query) {
    if (query != null) {
        query = query + ": ";
    }
    return query;
};
var inputConsole = function (query, format) {
    if (format === void 0) { format = true; }
    return readline_sync_1.default.question(format ? formatQuery(query) : query);
};
var inputKeyConsole = function (query) { return readline_sync_1.default.keyIn(formatQuery(query)); };
var inputNumConsole = function (float) {
    return function (query, min, max, showMinMax) {
        if (showMinMax === void 0) { showMinMax = true; }
        var mm = '';
        if (showMinMax)
            if (min != null && max == null)
                mm = '>=' + min;
            else if (min == null && max != null)
                mm = '<=' + max;
            else if (min != null && max != null)
                mm = min + '..' + max;
        while (true) {
            var i = readline_sync_1.default.question(query + (mm !== '' ? " [" + mm + "]: " : ': '));
            var a = float ? parseFloat(i) : parseInt(i, 10);
            if (!isNaN(a))
                if (a >= (min || Number.MIN_VALUE) && a <= (max || Number.MAX_VALUE))
                    return a;
            clearLine();
        }
    };
};
var inputYNConsole = function (query) {
    while (true) {
        var a = readline_sync_1.default.question(query + " [y/n]: ");
        if (a === 'y')
            return true;
        else if (a === 'n')
            return false;
        clearLine();
    }
};
var inputChooseConsole = function (values, query, showValues) {
    if (showValues === void 0) { showValues = true; }
    if (showValues) {
        for (var i = 0; i < values.length; i++)
            console.log("[" + (i + 1) + "] " + values[i]);
        console.log();
    }
    return inputNumConsole(false)(query, 1, values.length, false) - 1;
};
var clearLine = function () {
    readline_1.default.moveCursor(process.stdout, 0, -1);
    readline_1.default.clearLine(process.stdout, 0);
};
var IOMode;
(function (IOMode) {
    IOMode["CONSOLE"] = "CONSOLE";
})(IOMode = exports.IOMode || (exports.IOMode = {}));
//# sourceMappingURL=InputManager.js.map