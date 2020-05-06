import ClassType from "./ClassType";
import IGameStats from "./IGameStats";

export default interface IGameSave {

    player: {
        level: number;
        class: ClassType;
    };

    game_stats: IGameStats;

}