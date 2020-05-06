import fs from 'fs';
import rl, { keyInPause } from 'readline-sync';
// import ClassType from './ClassType';
import Fighter from './Fighter';
import Files from './Files';
import GameState from './GameState';
import IOpponent from './IClass';
import IClass from './IClass';
import IFightStats, { IFighterStats } from './IFightStats';
import IGameStats from './IGameStats';
import IKeyObject from './IKeyObject';
import IOManager, { IOMode } from './InputManager';
import { ISettings } from './ISettings';
import Opponent from './Opponent';
import Player from "./Player";

export default class Game {

    public static get Instance() {
        return Game._instance;
    }

    public get player() {
        return this._player;
    }

    public get opponent() {
        return this._opponent;
    }

    public get fight_stats() {
        return this._fight_stats || (this._fight_stats = empty_fight_stats);
    }

    private static _instance: Game;

    public readonly class_bases: IKeyObject<IClass>;
    public readonly settings: ISettings;
    public readonly io: IOManager;
    public readonly files: Files;

    public game_stats: IGameStats;

    private _player?: Player;
    private _opponent?: Opponent;

    private running: boolean = false;
    private state: GameState = GameState.Menu;
    private _fight_stats?: IFightStats;

    public constructor() {

        Game._instance = this;

        this.files = new Files();

        this.settings = this.files.loadSettings();
        this.class_bases = this.files.loadClassBases();

        this.game_stats = empty_game_stats;

        this.io = new IOManager(IOMode.CONSOLE);

        // this.newFight();

    }

    public start() {

        this.setGameState(GameState.Menu);
        this.loop();

    }

    public setGameState(state: GameState): void {
        this.state = state;
    }

    public endRound(winner: "player" | "opponent") {

        this.fight_stats.winner = winner;
        this.fight_stats.end_time = Date.now();

        this.game_stats.fights++;

        if (winner === 'player') {
            this.game_stats.wins++;

            if (this.player)
                this.player.level++;
        } else this.game_stats.losses++;

        this.game_stats.total_player_crit_hits += this.fight_stats.player.crit_hits;
        this.game_stats.total_player_damage_dealt += this.fight_stats.player.damage_dealt;
        this.game_stats.total_player_times_blocked += this.fight_stats.player.times_blocked;

        this.setGameState(GameState.Finish);

    }

    public newFight() {

        const classes = Object.keys(this.class_bases);

        if (this._player == null) {

            this.io.clear();

            const ind = this.io.inputChoose(classes.concat(['Back']), 'Which class do you wish to be?');

            if (ind === classes.length)
                return;

            this._player = new Player(classes[ind]/* as ClassType*/);

        } else {

            this._player = new Player(this._player.class_type, this._player.level);

        }

        this._opponent = new Opponent(classes[Math.floor(Math.random() * classes.length)]/* as ClassType*/,
            Math.floor(this._player.level * this.settings.level_opponent_scale));

        this._fight_stats = empty_fight_stats;
        this.setGameState(GameState.Fight);

    }

    // tslint:disable-next-line: no-empty
    public endTurn() { }

    private loop() {

        this.running = true;

        const menu = () => {

            const ind = this.io.inputChoose(['New', 'Load', 'Settings', 'Stats', 'Quit'], 'Select');

            switch (ind) {
                case 0:
                    this.newFight();
                    break;
                case 1:
                    while (true) {
                        this.io.clear();

                        const saves = this.files.listSaves();

                        if (saves.length > 0) {

                            const i = this.io.inputChoose(saves, 'Select save');
                            const save = this.files.loadGame(saves[i]);

                            if (save != null) {
                                this.game_stats = save.game_stats;
                                this._player = new Player(save.player.class, save.player.level);

                                this.newFight();

                                break;
                            } else {
                                this.io.newLine();
                                this.io.output('Failed to load save.');
                                this.io.newLine();

                                const ii = this.io.inputChoose(['New game', 'Try again'], 'Select');

                                if (ii === 0) {
                                    this.newFight();
                                    break;
                                }
                            }
                        } else {
                            this.io.output('There are no saves. ');
                            this.io.input('Press enter to continue...', false);

                            break;
                        }
                    }
                    break;
                case 2:
                    this.setGameState(GameState.Settings);
                    break;
                case 3:
                    this.setGameState(GameState.Stats);
                    break;
                case 4:
                    this.running = false;
                    break;

            }

        };

        let lastTurn: 'o' | 'p' = 'p';

        const fight = () => {
            if (this.player && this.opponent) {
                if (this.fight_stats.start_time === 0)
                    this.fight_stats.start_time = Date.now();

                this.printStats(this.player, this.opponent);
                this.io.newLine();

                if (lastTurn !== 'o') {
                    this.io.output('Opponent\'s turn!');
                    this.opponent.turn(this.player);

                    this.io.newLine();
                    this.io.input('Press enter to continue...', false);

                    this.io.clear();

                    lastTurn = 'o';
                } else {
                    this.io.output('Your turn!');

                    this.player.turn(this.opponent);

                    if (this.state === GameState.Fight) {
                        this.io.newLine();
                        this.io.input('Next turn...', false);

                        lastTurn = 'p';
                    } else if (this.state === GameState.Finish) {
                        this.io.newLine();
                        this.io.input('Press enter to continue...', false);

                        lastTurn = 'p';
                    }
                }
            } else {
                this.setGameState(GameState.Menu);
            }
        };

        const pause = () => {
            const ind = this.io.inputChoose(['Resume', 'Menu', 'Quit Game'], 'What will you do?');

            if (ind === 0)
                this.setGameState(GameState.Fight);
            else if (ind === 1)
                this.setGameState(GameState.Menu);
            else if (ind === 2)
                this.running = false;
        };

        const finish = () => {
            const printStats = (p: IFighterStats, o: IFighterStats) => {
                const space = '    ';

                const col1 = Math.max(
                    'Player'.length,
                    len(p.damage_dealt),
                    len(p.times_blocked),
                    len(p.crit_hits)
                );
                const col2 = Math.max(
                    'Opponent'.length,
                    len(o.damage_dealt),
                    len(o.times_blocked),
                    len(o.crit_hits)
                );

                this.io.output('Fighter:       ' + space
                    + pad('Player', col1) + space
                    + pad('Opponent', col2));
                this.io.output('Damage dealt:  ' + space
                    + padn(p.damage_dealt, col1) + space
                    + padn(o.damage_dealt, col2));
                this.io.output('Times blocked: ' + space
                    + padn(p.times_blocked, col1) + space
                    + padn(o.times_blocked, col2));
                this.io.output('Critical hits: ' + space
                    + padn(p.crit_hits, col1) + space
                    + padn(o.crit_hits, col2));
            };

            this.io.output(`And the winner is: ${this.fight_stats.winner}`);
            this.io.newLine();
            // TODO: format time
            this.io.output(`The fight went on for ${(this.fight_stats.end_time - this.fight_stats.start_time) / 1000} seconds.`);
            this.io.newLine();
            printStats(this.fight_stats.player, this.fight_stats.opponent);
            this.io.newLine();

            const ind = this.io.inputChoose(['Next Fight', 'Save', 'Quit Game'], 'What will you do?');

            if (ind === 0)
                this.newFight();
            else if (ind === 1) {
                if (this.files.current_save_title != null) {
                    const yn = this.io.inputYN('Save to ' + this.files.current_save_title);

                    if (yn) {
                        this.files.saveGame();
                        return;
                    }
                }

                const saveTitle = this.io.input('Save title');

                this.files.current_save_title = saveTitle;
                this.files.saveGame(saveTitle);
            } else {
                this.running = false;
            }
        };

        let settings_page: 'first' | 'settings' | 'classes' = 'first';
        let selected_class: string = 'none';

        const settings = () => {

            switch (settings_page) {

                case 'first':
                    const ind = this.io.inputChoose(['Edit Settings', 'Edit Classes', 'Back'],
                        'What do you wish to do?');

                    if (ind === 0) {
                        settings_page = 'settings';
                    } else if (ind === 1) {
                        settings_page = 'classes';
                    } else {
                        this.setGameState(GameState.Menu);
                    }

                    break;

                case 'settings':

                    this.editObject(this.settings,
                        (key, val) => {
                            (this.settings as IKeyObject<any>)[key] = val;
                            this.files.saveSettings();
                        },
                        () => true,
                        () => {
                            settings_page = 'first';
                        }
                    );

                    break;

                case 'classes':

                    if (selected_class === 'none') {

                        const c: string[] = [];

                        for (const key of Object.keys(this.class_bases))
                            c.push(key.toLowerCase());

                        this.io.output('Classes: ' + c.join(', '));

                        this.io.newLine();
                        const input = this.io.input('Which class do you wish to modify? To go back, enter \'back\'.\nTo add a new class, enter \'new\'.\n', false)
                            .toLowerCase();

                        if (input === 'back') {
                            settings_page = 'first';
                            selected_class = 'none';
                        } else if (input === 'new') {
                            selected_class = 'new';
                        } else if (c.includes(input)) {
                            selected_class = input.toUpperCase()/* as ClassType*/;
                        } else {
                            this.io.output('No class with that name exists.');
                            this.io.input('Press enter to continue...', false);
                        }

                    } else if (selected_class === 'new') {

                        this.io.clear();

                        const types = require('./IClassTypes.json');
                        const keys = Object.keys(this.class_bases[Object.keys(this.class_bases)[0]]);

                        while (true) {

                            const name = this.io.input('What will your class be called? ', false).toUpperCase();
                            const newClass: IKeyObject<any> = {};

                            for (const key of keys) {
                                if (types[key] === 'string')
                                    newClass[key] = this.io.input(key);
                                else if (types[key] === 'float')
                                    newClass[key] = this.io.inputFloat(key);
                                else if (types[key] === 'int')
                                    newClass[key] = this.io.inputInt(key);
                            }

                            if (this.io.inputYN('Confirm new class')) {
                                this.class_bases[name] = newClass as IClass;
                                this.files.saveClassBases();

                                selected_class = 'none';
                                break;
                            } else {
                                if (this.io.inputChoose(['Try again', 'Back']) === 1) {
                                    selected_class = 'none';
                                    break;
                                }
                            }
                        }

                    } else {

                        this.editObject(this.class_bases[selected_class],
                            (key, val) => {
                                (this.class_bases[selected_class] as IKeyObject<any>)[key] = val;
                                this.files.saveClassBases();
                            },
                            (key, val) => {
                                if (key === 'weakness')
                                    if (typeof val === 'string'
                                        && Object.keys(this.class_bases).includes(val.toUpperCase()))
                                        return true;
                                    else
                                        return false;
                                else
                                    return true;
                            },
                            () => {
                                selected_class = 'none';
                            }
                        );

                    }

                    break;

            }

        };

        const stats = () => {
            for (const k of pado(this.game_stats))
                this.io.output(k);

            this.io.newLine();

            this.io.input('Press enter to go back...', false);
            this.setGameState(GameState.Menu);
        };

        while (this.running) {
            this.io.clear();

            switch (this.state) {
                case GameState.Menu:
                    menu();
                    break;
                case GameState.Fight:
                    fight();
                    break;
                case GameState.Pause:
                    pause();
                    break;
                case GameState.Finish:
                    finish();
                    break;
                case GameState.Settings:
                    settings();
                    break;
                case GameState.Stats:
                    stats();
                    break;
            }
        }
    }

    private printStats(p: Fighter, o: Fighter) {
        // todo: have non hard coded values

        const space = '    ';

        const classLength = Math.max('Class'.length, len(p.class_type), len(o.class_type));
        const levelLegnth = Math.max('Level'.length, len(p.level), len(o.level));
        const healthLength = Math.max('Health'.length, len(p.health), len(o.health));
        const armorLength = Math.max('Armor'.length, len(p.armor), len(o.armor));

        this.io.output('Stats:    ' + space
            + pad('Class', classLength) + space
            + pad('Level', levelLegnth) + space
            + pad('Health', healthLength) + space
            + pad('Armor', armorLength));
        this.io.output('Player:   ' + space
            + pad(p.class_type, classLength) + space
            + padn(p.level, levelLegnth) + space
            + padn(p.health, healthLength) + space
            + padn(p.armor, armorLength));
        this.io.output('Opponent: ' + space
            + pad(o.class_type, classLength) + space
            + padn(o.level, levelLegnth) + space
            + padn(o.health, healthLength) + space
            + padn(o.armor, armorLength));
    }

    private editObject(o: IKeyObject<any>,
        set: (key: string, newValue: any) => void,
        check: (key: string, val: any) => boolean,
        back: () => void) {

        for (const k of pado(o))
            this.io.output(k);

        this.io.newLine();
        this.io.output('To edit a value, enter the key. To go back, enter \'back\'.');

        const input = this.io.input('> ', false).toLowerCase();

        if (input in o) {
            let newValue: any;

            if (typeof o[input] === 'number')
                newValue = this.io.inputFloat('New value');
            else
                newValue = this.io.input('New value');

            if (check(input, newValue)) {
                const confirm = this.io.inputYN('Confirm changes?');

                if (confirm)
                    set(input, newValue);
            } else {
                this.io.output('Invalid value.');
                this.io.input('Press enter to continue...', false);
            }
        } else if (input === 'back') {
            back();
        } else {
            this.io.output('No key with that name exists.');
            this.io.input('Press enter to continue...', false);
        }
    }

}

const pado = (o: IKeyObject<any>) => {
    const ret: string[] = [];
    let maxLength = 0;

    for (const key in o)
        maxLength = Math.max((key + ':').length, maxLength);

    for (const key in o)
        if (o.hasOwnProperty(key))
            ret.push(`${pad(key + ':', maxLength)} ${o[key]}`);

    return ret;
};

const pad = (s: string, n: number) => {
    for (let i = s.length; i < n; i++)
        s += ' ';
    return s;
};

const padn = (s: number, n: number) => pad(s.toString(), n);

const len = (n: any) => n.toString().length;

const empty_fight_stats: IFightStats = {
    opponent: {
        crit_hits: 0,
        damage_dealt: 0,
        times_blocked: 0
    },
    player: {
        crit_hits: 0,
        damage_dealt: 0,
        times_blocked: 0
    },
    start_time: 0,
    end_time: 0,
    winner: 'fight'
};

const empty_game_stats: IGameStats = {
    wins: 0,
    losses: 0,
    fights: 0,

    total_player_crit_hits: 0,
    total_player_damage_dealt: 0,
    total_player_times_blocked: 0
};
