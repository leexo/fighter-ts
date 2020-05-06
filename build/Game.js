"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Files_1 = __importDefault(require("./Files"));
var GameState_1 = __importDefault(require("./GameState"));
var InputManager_1 = __importStar(require("./InputManager"));
var Opponent_1 = __importDefault(require("./Opponent"));
var Player_1 = __importDefault(require("./Player"));
var Game = /** @class */ (function () {
    function Game() {
        this.running = false;
        this.state = GameState_1.default.Menu;
        Game._instance = this;
        this.files = new Files_1.default();
        this.settings = this.files.loadSettings();
        this.class_bases = this.files.loadClassBases();
        this.game_stats = empty_game_stats;
        this.io = new InputManager_1.default(InputManager_1.IOMode.CONSOLE);
        // this.newFight();
    }
    Object.defineProperty(Game, "Instance", {
        get: function () {
            return Game._instance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "player", {
        get: function () {
            return this._player;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "opponent", {
        get: function () {
            return this._opponent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "fight_stats", {
        get: function () {
            return this._fight_stats || (this._fight_stats = empty_fight_stats);
        },
        enumerable: true,
        configurable: true
    });
    Game.prototype.start = function () {
        this.setGameState(GameState_1.default.Menu);
        this.loop();
    };
    Game.prototype.setGameState = function (state) {
        this.state = state;
    };
    Game.prototype.endRound = function (winner) {
        this.fight_stats.winner = winner;
        this.fight_stats.end_time = Date.now();
        this.game_stats.fights++;
        if (winner === 'player') {
            this.game_stats.wins++;
            if (this.player)
                this.player.level++;
        }
        else
            this.game_stats.losses++;
        this.game_stats.total_player_crit_hits += this.fight_stats.player.crit_hits;
        this.game_stats.total_player_damage_dealt += this.fight_stats.player.damage_dealt;
        this.game_stats.total_player_times_blocked += this.fight_stats.player.times_blocked;
        this.setGameState(GameState_1.default.Finish);
    };
    Game.prototype.newFight = function () {
        var classes = Object.keys(this.class_bases);
        if (this._player == null) {
            this.io.clear();
            var class_type = classes[this.io.inputChoose(classes, 'Which class do you wish to be?')];
            this._player = new Player_1.default(class_type);
        }
        else {
            this._player = new Player_1.default(this._player.class_type, this._player.level);
        }
        this._opponent = new Opponent_1.default(classes[Math.floor(Math.random() * classes.length)], Math.floor(this._player.level * this.settings.level_opponent_scale));
        this._fight_stats = empty_fight_stats;
        this.setGameState(GameState_1.default.Fight);
    };
    // tslint:disable-next-line: no-empty
    Game.prototype.endTurn = function () { };
    Game.prototype.loop = function () {
        var _this = this;
        this.running = true;
        var menu = function () {
            var ind = _this.io.inputChoose(['New', 'Load', 'Settings', 'Stats', 'Quit'], 'Select');
            switch (ind) {
                case 0:
                    _this.newFight();
                    break;
                case 1:
                    while (true) {
                        _this.io.clear();
                        var saves = _this.files.listSaves();
                        if (saves.length > 0) {
                            var i = _this.io.inputChoose(saves, 'Select save');
                            var save = _this.files.loadGame(saves[i]);
                            if (save != null) {
                                _this.game_stats = save.game_stats;
                                _this._player = new Player_1.default(save.player.class, save.player.level);
                                _this.newFight();
                                break;
                            }
                            else {
                                _this.io.newLine();
                                _this.io.output('Failed to load save.');
                                _this.io.newLine();
                                var ii = _this.io.inputChoose(['New game', 'Try again'], 'Select');
                                if (ii === 0) {
                                    _this.newFight();
                                    break;
                                }
                            }
                        }
                        else {
                            _this.io.output('There are no saves. ');
                            _this.io.input('Press enter to continue...', false);
                            break;
                        }
                    }
                    break;
                case 2:
                    _this.setGameState(GameState_1.default.Settings);
                    break;
                case 3:
                    _this.setGameState(GameState_1.default.Stats);
                    break;
                case 4:
                    _this.running = false;
                    break;
            }
        };
        var lastTurn = 'p';
        var fight = function () {
            if (_this.player && _this.opponent) {
                if (_this.fight_stats.start_time === 0)
                    _this.fight_stats.start_time = Date.now();
                _this.printStats(_this.player, _this.opponent);
                _this.io.newLine();
                if (lastTurn !== 'o') {
                    _this.io.output('Opponent\'s turn!');
                    _this.opponent.turn(_this.player);
                    _this.io.newLine();
                    _this.io.input('Press enter to continue...', false);
                    _this.io.clear();
                    lastTurn = 'o';
                }
                else {
                    _this.io.output('Your turn!');
                    _this.player.turn(_this.opponent);
                    if (_this.state === GameState_1.default.Fight) {
                        _this.io.newLine();
                        _this.io.input('Next turn...', false);
                        lastTurn = 'p';
                    }
                }
            }
            else {
                _this.setGameState(GameState_1.default.Menu);
            }
        };
        var pause = function () {
            var ind = _this.io.inputChoose(['Resume', 'Menu', 'Quit Game'], 'What will you do?');
            if (ind === 0)
                _this.setGameState(GameState_1.default.Fight);
            else if (ind === 1)
                _this.setGameState(GameState_1.default.Menu);
            else if (ind === 2)
                _this.running = false;
        };
        var finish = function () {
            var printStats = function (p, o) {
                var space = '    ';
                var col1 = Math.max('Player'.length, len(p.damage_dealt), len(p.times_blocked), len(p.crit_hits));
                var col2 = Math.max('Opponent'.length, len(o.damage_dealt), len(o.times_blocked), len(o.crit_hits));
                _this.io.output('Fighter:       ' + space
                    + pad('Player', col1) + space
                    + pad('Opponent', col2));
                _this.io.output('Damage dealt:  ' + space
                    + padn(p.damage_dealt, col1) + space
                    + padn(o.damage_dealt, col2));
                _this.io.output('Times blocked: ' + space
                    + padn(p.times_blocked, col1) + space
                    + padn(o.times_blocked, col2));
                _this.io.output('Critical hits: ' + space
                    + padn(p.crit_hits, col1) + space
                    + padn(o.crit_hits, col2));
            };
            _this.io.output("And the winner is: " + _this.fight_stats.winner);
            _this.io.newLine();
            // TODO: format time
            _this.io.output("The fight went on for " + (_this.fight_stats.end_time - _this.fight_stats.start_time) / 1000 + " seconds.");
            _this.io.newLine();
            printStats(_this.fight_stats.player, _this.fight_stats.opponent);
            _this.io.newLine();
            var ind = _this.io.inputChoose(['Next Fight', 'Save', 'Quit Game'], 'What will you do?');
            if (ind === 0)
                _this.newFight();
            else if (ind === 1) {
                if (_this.files.current_save_title != null) {
                    var yn = _this.io.inputYN('Save to ' + _this.files.current_save_title);
                    if (yn) {
                        _this.files.saveGame();
                        return;
                    }
                }
                var saveTitle = _this.io.input('Save title');
                _this.files.current_save_title = saveTitle;
                _this.files.saveGame(saveTitle);
            }
            else {
                _this.running = false;
            }
        };
        var settings_page = 'first';
        var selected_class = 'none';
        var settings = function () {
            switch (settings_page) {
                case 'first':
                    var ind = _this.io.inputChoose(['Edit Settings', 'Edit Classes', 'Back'], 'What do you wish to do?');
                    if (ind === 0) {
                        settings_page = 'settings';
                    }
                    else if (ind === 1) {
                        settings_page = 'classes';
                    }
                    else {
                        _this.setGameState(GameState_1.default.Menu);
                    }
                    break;
                case 'settings':
                    _this.editObject(_this.settings, function (key, val) {
                        _this.settings[key] = val;
                        _this.files.saveSettings();
                    }, function () { return true; }, function () {
                        settings_page = 'first';
                    });
                    break;
                case 'classes':
                    if (selected_class === 'none') {
                        var c = [];
                        for (var _i = 0, _a = Object.keys(_this.class_bases); _i < _a.length; _i++) {
                            var key = _a[_i];
                            c.push(key.toLowerCase());
                        }
                        _this.io.output('Classes: ' + c.join(', '));
                        _this.io.newLine();
                        var input = _this.io.input('Which class do you wish to modify? To go back, enter \'back\'')
                            .toLowerCase();
                        if (input === 'back') {
                            settings_page = 'first';
                            selected_class = 'none';
                        }
                        else if (c.includes(input)) {
                            selected_class = input.toUpperCase();
                        }
                        else {
                            _this.io.output('No class with that name exists.');
                            _this.io.input('Press enter to continue...', false);
                        }
                    }
                    else {
                        _this.editObject(_this.class_bases[selected_class], function (key, val) {
                            _this.class_bases[selected_class][key] = val;
                            _this.files.saveClassBases();
                        }, function (key, val) {
                            if (key === 'weakness')
                                if (typeof val === 'string'
                                    && Object.keys(_this.class_bases).includes(val.toUpperCase()))
                                    return true;
                                else
                                    return false;
                            else
                                return true;
                        }, function () {
                            selected_class = 'none';
                        });
                    }
                    break;
            }
        };
        var stats = function () {
            for (var _i = 0, _a = pado(_this.game_stats); _i < _a.length; _i++) {
                var k = _a[_i];
                _this.io.output(k);
            }
            _this.io.newLine();
            _this.io.input('Press enter to go back...', false);
            _this.setGameState(GameState_1.default.Menu);
        };
        while (this.running) {
            this.io.clear();
            switch (this.state) {
                case GameState_1.default.Menu:
                    menu();
                    break;
                case GameState_1.default.Fight:
                    fight();
                    break;
                case GameState_1.default.Pause:
                    pause();
                    break;
                case GameState_1.default.Finish:
                    finish();
                    break;
                case GameState_1.default.Settings:
                    settings();
                    break;
                case GameState_1.default.Stats:
                    stats();
                    break;
            }
        }
    };
    Game.prototype.printStats = function (p, o) {
        // todo: have non hard coded values
        var space = '    ';
        var classLength = Math.max('Class'.length, len(p.class_type), len(o.class_type));
        var levelLegnth = Math.max('Level'.length, len(p.level), len(o.level));
        var healthLength = Math.max('Health'.length, len(p.health), len(o.health));
        var armorLength = Math.max('Armor'.length, len(p.armor), len(o.armor));
        this.io.output('Stats:    ' + space
            + pad('Class', classLength) + space
            + pad('Level', levelLegnth) + space
            + pad('Health', healthLength) + space
            + pad('Armor', armorLength));
        this.io.output('Player:   ' + space
            + pad(p.class_type, classLength) + space
            + padn(p.level, levelLegnth) + space
            + padn(p.health, healthLength) + space
            + padn(p.armor, armorLength));
        this.io.output('Opponent: ' + space
            + pad(o.class_type, classLength) + space
            + padn(o.level, levelLegnth) + space
            + padn(o.health, healthLength) + space
            + padn(o.armor, armorLength));
    };
    Game.prototype.editObject = function (o, set, check, back) {
        for (var _i = 0, _a = pado(o); _i < _a.length; _i++) {
            var k = _a[_i];
            this.io.output(k);
        }
        this.io.newLine();
        this.io.output('To edit a value, enter the key. To go back, enter \'back\'.');
        var input = this.io.input('> ', false).toLowerCase();
        if (input in o) {
            var newValue = void 0;
            if (typeof o[input] === 'number')
                newValue = this.io.inputFloat('New value');
            else
                newValue = this.io.input('New value');
            if (check(input, newValue)) {
                var confirm_1 = this.io.inputYN('Confirm changes?');
                if (confirm_1)
                    set(input, newValue);
            }
            else {
                this.io.output('Invalid value.');
                this.io.input('Press enter to continue...', false);
            }
        }
        else if (input === 'back') {
            back();
        }
        else {
            this.io.output('No key with that name exists.');
            this.io.input('Press enter to continue...', false);
        }
    };
    return Game;
}());
exports.default = Game;
var pado = function (o) {
    var ret = [];
    var maxLength = 0;
    for (var key in o)
        maxLength = Math.max((key + ':').length, maxLength);
    for (var key in o)
        if (o.hasOwnProperty(key))
            ret.push(pad(key + ':', maxLength) + " " + o[key]);
    return ret;
};
var pad = function (s, n) {
    for (var i = s.length; i < n; i++)
        s += ' ';
    return s;
};
var padn = function (s, n) { return pad(s.toString(), n); };
var len = function (n) { return n.toString().length; };
var empty_fight_stats = {
    opponent: {
        crit_hits: 0,
        damage_dealt: 0,
        times_blocked: 0
    },
    player: {
        crit_hits: 0,
        damage_dealt: 0,
        times_blocked: 0
    },
    start_time: 0,
    end_time: 0,
    winner: 'fight'
};
var empty_game_stats = {
    wins: 0,
    losses: 0,
    fights: 0,
    total_player_crit_hits: 0,
    total_player_damage_dealt: 0,
    total_player_times_blocked: 0
};
//# sourceMappingURL=Game.js.map