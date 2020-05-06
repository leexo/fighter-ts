import Fighter, { AttackResult, IDealDamageData } from "./Fighter";
import Game from "./Game";
import GameState from "./GameState";
import getMessage from "./Messages";

export default class Player extends Fighter {

    public turn(opponent: Fighter): void {

        const io = Game.Instance.io;

        const deal = (a: IDealDamageData) => {
            if (a.crit && a.result !== AttackResult.Miss)
                Game.Instance.fight_stats.player.crit_hits++;

            switch (a.result) {

                case AttackResult.Block:
                    io.output(getMessage('player_opponent_block'));
                    Game.Instance.fight_stats.player.times_blocked++;
                    break;

                case AttackResult.Hit:
                    io.outputFormat(getMessage('player_hit'/* + (a.crit ? '_crit' : '')*/),
                        Math.round(a.damage),
                        Math.round(opponent.health));
                    Game.Instance.fight_stats.player.damage_dealt += a.damage;

                    break;

                case AttackResult.Kill:
                    io.outputFormat(getMessage('player_kill'/* + (a.crit ? '_crit' : '')*/), Math.round(a.damage));
                    Game.Instance.fight_stats.player.damage_dealt += a.damage;
                    Game.Instance.endRound('player');
                    break;

                case AttackResult.Miss:
                    io.output(getMessage('player_miss'));
                    break;

            }
        };

        const input = io.inputChoose(['Attack!', 'Rest...', 'Pause'], 'What will you do?');

        if (input === 0) {
            deal(this.dealDamage(opponent));
        } else if (input === 1) {
            this.rest();
            io.outputFormat(getMessage('player_rest'), Math.round(this.health));
        } else {
            Game.Instance.setGameState(GameState.Pause);
        }

        Game.Instance.endTurn();

    }

}