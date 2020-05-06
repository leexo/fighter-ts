import ClassType from "./ClassType";
import IMinMax from "./IMinMax";

export default interface IClass {

    health: number;
    damage_min: number;
    damage_max: number;
    armor: number;
    crit_chance: number;
    crit_mult: number;
    hit_chance: number;
    rest_restore: number;
    weakness: ClassType;

}