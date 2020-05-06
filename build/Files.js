"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
// import ClassType from './ClassType';
var Game_1 = __importDefault(require("./Game"));
var Files = /** @class */ (function () {
    function Files() {
    }
    Files.prototype.listSaves = function () {
        return fs_1.default.readdirSync('./saves').map(function (v) { return v.replace('.save', ''); });
    };
    Files.prototype.loadGame = function (s) {
        var p = './saves/' + s + '.save';
        if (fs_1.default.existsSync(p)) {
            try {
                this.current_save_title = s;
                return JSON.parse(Buffer.from(fs_1.default.readFileSync(p).toString(), 'base64').toString('utf-8'));
                // tslint:disable-next-line: no-empty
            }
            catch (e) {
                console.log(e);
            }
        }
    };
    Files.prototype.saveGame = function (s, overwrite) {
        if (overwrite === void 0) { overwrite = false; }
        if (s != null || this.current_save_title != null) {
            s = s || this.current_save_title;
            var p = './saves/' + s + '.save';
            if (!fs_1.default.existsSync(p) || overwrite) {
                var g = Game_1.default.Instance;
                var save = {
                    player: {
                        level: g.player != null ? g.player.level : 0,
                        class: g.player != null ? g.player.class_type : '' // ClassType.Archer
                    },
                    game_stats: g.game_stats
                };
                fs_1.default.writeFileSync(p, Buffer.from(JSON.stringify(save)).toString('base64'));
                return true;
            }
        }
        return false;
    };
    Files.prototype.loadSettings = function () {
        return require('../Settings.json');
    };
    Files.prototype.loadClassBases = function () {
        return require('../Classes.json');
    };
    Files.prototype.saveSettings = function () {
        fs_1.default.writeFileSync('./Settings.json', JSON.stringify(Game_1.default.Instance.settings, null, 4));
    };
    Files.prototype.saveClassBases = function () {
        fs_1.default.writeFileSync('./Classes.json', JSON.stringify(Game_1.default.Instance.class_bases, null, 4));
    };
    return Files;
}());
exports.default = Files;
