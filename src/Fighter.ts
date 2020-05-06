// import ClassType from "./ClassType";
import Game from "./Game";
import IClass from "./IClass";
import IMinMax from "./IMinMax";

export default abstract class Fighter {

    public get health() {
        return this._health;
    }

    public get armor() {
        return this._armor;
    }

    public set armor(n: number) {

        this._armor = Math.floor(Math.max(n, 0));

    }

    public readonly base: IClass;

    public level: number;
    public readonly class_type: string;
    public readonly damage: IMinMax;
    public readonly crit_chance: number;
    public readonly crit_mult: number;
    public readonly hit_chance: number;
    public readonly rest_restore: number;
    public readonly weakness: string;
    public _armor: number;

    private _health: number;

    public constructor(type: string, level: number = 1) {

        const data = applyLevelMult(Game.Instance.class_bases[type], level);

        this.base = data;

        this.class_type = type;

        this.level = level;

        this._health = data.health;
        this.damage = {
            min: data.damage_min,
            max: data.damage_max
        };
        this._armor = data.armor;

        this.crit_chance = data.crit_chance;
        this.crit_mult = data.crit_mult;
        this.hit_chance = data.hit_chance;
        this.rest_restore = data.rest_restore;

        this.weakness = data.weakness;
    }

    public abstract turn(opponent: Fighter): void;

    public rest() {
        this._health = Math.min(this.health + this.rest_restore, this.base.health);
    }

    public takeDamage(damage: number, opponent: Fighter) {
        if (Math.random() > (this.armor / 100) * Game.Instance.settings.armor_mult
            || opponent.class_type === 'WIZARD') {
            if (Math.random() < this.hit_chance) {
                this._health -= damage;
                return this._health <= 0 ? AttackResult.Kill : AttackResult.Hit;
            } else return AttackResult.Miss;
        } else {
            this.armor -= damage * Game.Instance.settings.block_armor_damage_mult;
            return AttackResult.Block;
        }
    }

    protected dealDamage(fighter: Fighter): IDealDamageData {
        const crit = Math.random() <= this.crit_chance;
        const damage = Math.round(
            Math.round(Math.random() * (this.damage.max - this.damage.min) + this.damage.min)
            * (crit ? this.crit_mult : 1)
            * (fighter.weakness === this.class_type ? Game.Instance.settings.weakness_mult : 1)
        );

        return {
            result: fighter.takeDamage(damage, this),
            damage,
            crit
        };
    }

    protected calcMaxDamage(fighter: Fighter) {
        return this.damage.max
            * this.crit_mult
            * (fighter.weakness === this.class_type ? Game.Instance.settings.weakness_mult : 1);
    }

}

const applyLevelMult = (data: IClass, level: number) => {
    const level_mult = 1 + (level - 1) * Game.Instance.settings.level_scale_mult;

    data.health *= level_mult;
    data.damage_min *= level_mult;
    data.damage_max *= level_mult;

    data.armor = Math.min(data.armor * level_mult, 100);

    data.crit_chance = Math.min(data.crit_chance * level_mult, Game.Instance.settings.max_crit_chance);
    data.crit_mult = data.crit_mult * level_mult;
    data.hit_chance = Math.min(data.hit_chance * level_mult, 1);
    data.rest_restore = data.rest_restore * level_mult;

    return data;
};

export enum AttackResult {

    Block = "BLOCK",
    Miss = "MISS",
    Hit = "HIT",
    Kill = "KILL"

}

export interface IDealDamageData {
    result: AttackResult;
    damage: number;
    crit: boolean;
}