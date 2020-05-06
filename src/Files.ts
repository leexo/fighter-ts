import fs from 'fs';
// import ClassType from './ClassType';
import Game from './Game';
import IClass from './IClass';
import IGameSave from './IGameSave';
import IKeyObject from './IKeyObject';
import { ISettings } from './ISettings';
import Player from './Player';

export default class Files {

    public current_save_title?: string;

    public listSaves() {
        return fs.readdirSync('./saves').map((v) => v.replace('.save', ''));
    }

    public loadGame(s: string) {
        const p = './saves/' + s + '.save';

        if (fs.existsSync(p)) {
            try {
                this.current_save_title = s;
                return JSON.parse(Buffer.from(fs.readFileSync(p).toString(), 'base64').toString('utf-8')) as IGameSave;
                // tslint:disable-next-line: no-empty
            } catch (e) {
                console.log(e);
            }
        }
    }

    public saveGame(s?: string, overwrite = false) {
        if (s != null || this.current_save_title != null) {
            s = s || this.current_save_title;

            const p = './saves/' + s + '.save';

            if (!fs.existsSync(p) || overwrite) {

                const g = Game.Instance;

                const save: IGameSave = {

                    player: {
                        level: g.player != null ? g.player.level : 0,
                        class: g.player != null ? g.player.class_type : '' // ClassType.Archer
                    },

                    game_stats: g.game_stats

                };

                fs.writeFileSync(p, Buffer.from(JSON.stringify(save)).toString('base64'));

                return true;
            }
        }

        return false;
    }

    public loadSettings() {
        return require('../Settings.json') as ISettings;
    }

    public loadClassBases() {
        return require('../Classes.json') as IKeyObject<IClass>;
    }

    public saveSettings() {
        fs.writeFileSync('./Settings.json', JSON.stringify(Game.Instance.settings, null, 4));
    }
    public saveClassBases() {
        fs.writeFileSync('./Classes.json', JSON.stringify(Game.Instance.class_bases, null, 4));
    }

}