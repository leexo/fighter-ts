export default interface IFightStats {

    start_time: number;
    end_time: number;

    winner: "player" | "opponent" | "fight";

    player: IFighterStats;
    opponent: IFighterStats;

}

export interface IFighterStats {

    damage_dealt: number;
    times_blocked: number;
    crit_hits: number;

}