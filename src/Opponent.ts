import Fighter, { AttackResult, IDealDamageData } from "./Fighter";
import Game from "./Game";
import getMessage from "./Messages";

export default class Opponent extends Fighter {

    public turn(player: Fighter): void {

        const io = Game.Instance.io;

        const deal = (a: IDealDamageData) => {
            if (a.crit && a.result !== AttackResult.Miss)
                Game.Instance.fight_stats.opponent.crit_hits++;

            switch (a.result) {

                case AttackResult.Block:
                    io.output(getMessage('opponent_player_block'));
                    Game.Instance.fight_stats.opponent.times_blocked ++;
                    break;

                case AttackResult.Hit:
                    io.outputFormat(getMessage('opponent_hit'), a.damage, player.health);
                    Game.Instance.fight_stats.opponent.damage_dealt += a.damage;
                    break;

                case AttackResult.Kill:
                    io.outputFormat(getMessage('opponent_kill'), a.damage);
                    Game.Instance.fight_stats.opponent.damage_dealt += a.damage;
                    Game.Instance.endRound('opponent');
                    break;

                case AttackResult.Miss:
                    io.output(getMessage('opponent_miss'));
                    break;

            }
        };

        if (player.health < this.calcMaxDamage(player)) {
            deal(this.dealDamage(player));
        } else if (this.health < this.base.health * 0.2) {
            this.rest();
            io.outputFormat(getMessage('opponent_rest'), this.health);
        } else {
            deal(this.dealDamage(player));
        }

        Game.Instance.endTurn();
    }

}

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