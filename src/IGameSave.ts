import IGameStats from "./IGameStats";

export default interface IGameSave {

    player: {
        level: number;
        class: string;
    };

    game_stats: IGameStats;

}