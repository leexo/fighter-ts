"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Fighter_1 = __importStar(require("./Fighter"));
var Game_1 = __importDefault(require("./Game"));
var GameState_1 = __importDefault(require("./GameState"));
var Messages_1 = __importDefault(require("./Messages"));
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Player.prototype.turn = function (opponent) {
        var io = Game_1.default.Instance.io;
        var deal = function (a) {
            if (a.crit && a.result !== Fighter_1.AttackResult.Miss)
                Game_1.default.Instance.fight_stats.player.crit_hits++;
            switch (a.result) {
                case Fighter_1.AttackResult.Block:
                    io.output(Messages_1.default('player_opponent_block'));
                    Game_1.default.Instance.fight_stats.player.times_blocked++;
                    break;
                case Fighter_1.AttackResult.Hit:
                    io.outputFormat(Messages_1.default('player_hit' /* + (a.crit ? '_crit' : '')*/), a.damage, opponent.health);
                    Game_1.default.Instance.fight_stats.player.damage_dealt += a.damage;
                    break;
                case Fighter_1.AttackResult.Kill:
                    io.outputFormat(Messages_1.default('player_kill' /* + (a.crit ? '_crit' : '')*/), a.damage);
                    Game_1.default.Instance.fight_stats.player.damage_dealt += a.damage;
                    Game_1.default.Instance.endRound('player');
                    break;
                case Fighter_1.AttackResult.Miss:
                    io.output(Messages_1.default('player_miss'));
                    break;
            }
        };
        var input = io.inputChoose(['Attack!', 'Rest...', 'Pause'], 'What will you do?');
        if (input === 0) {
            deal(this.dealDamage(opponent));
        }
        else if (input === 1) {
            this.rest();
            io.outputFormat(Messages_1.default('player_rest'), this.health);
        }
        else {
            Game_1.default.Instance.setGameState(GameState_1.default.Pause);
        }
        Game_1.default.Instance.endTurn();
    };
    return Player;
}(Fighter_1.default));
exports.default = Player;
//# sourceMappingURL=Player.js.map