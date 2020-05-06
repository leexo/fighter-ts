"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Messages_json_1 = __importDefault(require("./Messages.json"));
var m = Messages_json_1.default;
var getMessage = function (key) {
    if (key in Messages_json_1.default)
        if (typeof m[key] === 'string')
            return m[key];
        else
            return m[key][(Math.floor(Math.random() * m[key].length))];
    return 'undefined';
};
exports.default = getMessage;
//# sourceMappingURL=Messages.js.map