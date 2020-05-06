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
var Messages_1 = __importDefault(require("./Messages"));
var Opponent = /** @class */ (function (_super) {
    __extends(Opponent, _super);
    function Opponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Opponent.prototype.turn = function (player) {
        var io = Game_1.default.Instance.io;
        var deal = function (a) {
            if (a.crit && a.result !== Fighter_1.AttackResult.Miss)
                Game_1.default.Instance.fight_stats.opponent.crit_hits++;
            switch (a.result) {
                case Fighter_1.AttackResult.Block:
                    io.output(Messages_1.default('opponent_player_block'));
                    Game_1.default.Instance.fight_stats.opponent.times_blocked++;
                    break;
                case Fighter_1.AttackResult.Hit:
                    io.outputFormat(Messages_1.default('opponent_hit'), Math.round(a.damage), Math.round(player.health));
                    Game_1.default.Instance.fight_stats.opponent.damage_dealt += a.damage;
                    break;
                case Fighter_1.AttackResult.Kill:
                    io.outputFormat(Messages_1.default('opponent_kill'), Math.round(a.damage));
                    Game_1.default.Instance.fight_stats.opponent.damage_dealt += a.damage;
                    Game_1.default.Instance.endRound('opponent');
                    break;
                case Fighter_1.AttackResult.Miss:
                    io.output(Messages_1.default('opponent_miss'));
                    break;
            }
        };
        if (player.health < this.calcMaxDamage(player)) {
            deal(this.dealDamage(player));
        }
        else if (this.health < this.base.health * 0.2) {
            this.rest();
            io.outputFormat(Messages_1.default('opponent_rest'), Math.round(this.health));
        }
        else {
            deal(this.dealDamage(player));
        }
        Game_1.default.Instance.endTurn();
    };
    return Opponent;
}(Fighter_1.default));
exports.default = Opponent;
/*

export default abstract class Opponent {

    public static get Base(): IOpponent {
        return {
            name: 'base_name',
            base_health: 100,
            level: 3,

            attacks: {
                bow: {
                    attack_type: AttackType.RANGED,
                    damage: 10,
                    cooldown: 2,

                    level_requirement: 2,

                    crit_chance: 0.05,
                    crit_mult: 1.3,

                    dodge_chance: 0.1,
                    shield_damage: 3
                }
            },

            passive: {
                move_back: PassiveMoveType.MOVE_BACK,
                move_forwar: PassiveMoveType.MOVE_FORWARD
            }
        };
    }

    private opponent_data: IOpponent;

    public constructor(data?: IOpponent) {
        this.opponent_data = data || Opponent.Base;
    }

    public turn(): void {

        const c = this.getTotalChance();

    }

    public hasRangedAttack() {

        for (const key in this.opponent_data.attacks)
            if (this.opponent_data.attacks[key].attack_type === AttackType.RANGED)
                return true;

        return false;

    }

    public getMoves(...types: AttackType[]) {

        const moves: IKeyObject<IMove> = {};

        const allMoves: IKeyObject<IMove> = {

            ...this.opponent_data.attacks,
            ...this.opponent_data.passive

        };

        for (const key in allMoves) {
            if (allMoves.hasOwnProperty(key)) {
                const move = allMoves[key];

            }
        }

    }

    private getTotalChance(moves: IKeyObject<IMove>) {

        let t = 0;

        for (const key in moves)
            t += moves[key].chance;

        return t;

    }

}

export interface IOpponent {

    name: string;
    base_health: number;
    level: number;

    attacks: IKeyObject<IAttack>;
    passive: IKeyObject<IPassiveMove>;

}

export interface IMove {

    chance: number; // greater number means bigger chance

}

export enum PassiveMoveType {

    MOVE_BACK = "MOVE_BACK",
    MOVE_FORWARD = "MOVE_FORWARD"

}

export interface IPassiveMove extends IMove {

    move: PassiveMoveType;

}

export interface IAttack extends IMove {

    level_requirement: number;

    damage: number;
    cooldown: number; // In moves

    attack_type: AttackType;

    crit_chance: number;
    crit_mult: number;

    dodge_chance: number;

    shield_damage: number;

}

export enum AttackType {

    CLOSE = "CLOSE",
    RANGED = "RANGED"

}

export type AttackFunction = (...args: any[]) => void;

*/ 
