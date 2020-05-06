"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import ClassType from "./ClassType";
var Game_1 = __importDefault(require("./Game"));
var Fighter = /** @class */ (function () {
    function Fighter(type, level) {
        if (level === void 0) { level = 1; }
        var data = applyLevelMult(Game_1.default.Instance.class_bases[type], level);
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
    Object.defineProperty(Fighter.prototype, "health", {
        get: function () {
            return this._health;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Fighter.prototype, "armor", {
        get: function () {
            return this._armor;
        },
        set: function (n) {
            this._armor = Math.floor(Math.max(n, 0));
        },
        enumerable: true,
        configurable: true
    });
    Fighter.prototype.rest = function () {
        this._health = Math.min(this.health + this.rest_restore, this.base.health);
    };
    Fighter.prototype.takeDamage = function (damage, opponent) {
        if (Math.random() > (this.armor / 100) * Game_1.default.Instance.settings.armor_mult
            || opponent.class_type === 'WIZARD' || opponent.class_type === 'WARLOCK') {
            if (Math.random() < this.hit_chance) {
                this._health -= damage;
                return this._health <= 0 ? AttackResult.Kill : AttackResult.Hit;
            }
            else
                return AttackResult.Miss;
        }
        else {
            this.armor -= damage * Game_1.default.Instance.settings.block_armor_damage_mult;
            return AttackResult.Block;
        }
    };
    Fighter.prototype.dealDamage = function (fighter) {
        var crit = Math.random() <= this.crit_chance;
        var damage = Math.round(Math.round(Math.random() * (this.damage.max - this.damage.min) + this.damage.min)
            * (crit ? this.crit_mult : 1)
            * (fighter.weakness === this.class_type ? Game_1.default.Instance.settings.weakness_mult : 1));
        return {
            result: fighter.takeDamage(damage, this),
            damage: damage,
            crit: crit
        };
    };
    Fighter.prototype.calcMaxDamage = function (fighter) {
        return this.damage.max
            * this.crit_mult
            * (fighter.weakness === this.class_type ? Game_1.default.Instance.settings.weakness_mult : 1);
    };
    return Fighter;
}());
exports.default = Fighter;
var applyLevelMult = function (data, level) {
    var level_mult = Math.max(1, Math.pow(Game_1.default.Instance.settings.level_scale_mult, (level - 1)));
    data.health = Math.round(data.health * level_mult);
    data.damage_min = Math.round(data.damage_min * level_mult);
    data.damage_max = Math.round(data.damage_max * level_mult);
    data.armor = Math.min(Math.round(data.armor * level_mult), 100);
    data.crit_chance = Math.min(data.crit_chance * level_mult, Game_1.default.Instance.settings.max_crit_chance);
    data.crit_mult = data.crit_mult * level_mult;
    data.hit_chance = Math.min(data.hit_chance * level_mult, 1);
    data.rest_restore = data.rest_restore * level_mult;
    return data;
};
var AttackResult;
(function (AttackResult) {
    AttackResult["Block"] = "BLOCK";
    AttackResult["Miss"] = "MISS";
    AttackResult["Hit"] = "HIT";
    AttackResult["Kill"] = "KILL";
})(AttackResult = exports.AttackResult || (exports.AttackResult = {}));
//# sourceMappingURL=Fighter.js.map