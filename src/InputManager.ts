import readline from 'readline';
import rl from 'readline-sync';
import Messages from './Messages.json';

export default class IOManager {

    public output: (o?: any) => any;

    public mode = IOMode.CONSOLE;

    public clear: () => void;

    public input: (query?: string, format?: boolean) => string;
    public inputKey: (query?: string) => string;
    public inputInt: (query?: string, min?: number, max?: number, showMinMax?: boolean) => number;
    public inputFloat: (query?: string, min?: number, max?: number, showMinMax?: boolean) => number;
    public inputYN: (query?: string) => boolean;
    public inputChoose: (values: any[], query?: string, showValues?: boolean) => number;

    public constructor(mode: IOMode) {

        /*if(mode === IOMode.CONSOLE)
        { */

        this.output = console.log;

        this.clear = clearConsole;

        this.input = inputConsole;
        this.inputKey = inputKeyConsole;
        this.inputInt = inputNumConsole(false);
        this.inputFloat = inputNumConsole(true);
        this.inputYN = inputYNConsole;
        this.inputChoose = inputChooseConsole;

        // }

    }

    public newLine = () => this.output();

    public outputFormat = (s: string, ...args: any[]) => {

        let ind = s.indexOf(Messages.variable_identifier);
        let i = 0;

        while (ind !== -1 && i < args.length) {
            s = s.replace(Messages.variable_identifier, args[i]);

            ind = s.indexOf(Messages.variable_identifier);
            i++;
        }

        this.output(s);

    }

}

const clearConsole = console.clear;

const formatQuery = (query?: string) => {

    if (query != null) {

        query = `${query}: `;

    }

    return query;

};

const inputConsole = (query?: string, format: boolean = true) => rl.question(format ? formatQuery(query) : query);

const inputKeyConsole = (query?: string) => rl.keyIn(formatQuery(query));

const inputNumConsole = (float: boolean) => {
    return (query?: string, min?: number, max?: number, showMinMax: boolean = true) => {

        let mm = '';

        if (showMinMax)
            if (min != null && max == null)
                mm = '>=' + min;
            else if (min == null && max != null)
                mm = '<=' + max;
            else if (min != null && max != null)
                mm = min + '..' + max;

        while (true) {
            const i = rl.question(query + (mm !== '' ? ` [${mm}]: ` : ': '));
            const a = float ? parseFloat(i) : parseInt(i, 10);

            if (!isNaN(a))
                if (a >= (min || Number.MIN_VALUE) && a <= (max || Number.MAX_VALUE))
                    return a;

            clearLine();
        }

    };
};

const inputYNConsole = (query?: string) => {

    while (true) {

        const a = rl.question(`${query} [y/n]: `);

        if (a === 'y')
            return true;
        else if (a === 'n')
            return false;

        clearLine();

    }

};

const inputChooseConsole = (values: any[], query?: string, showValues: boolean = true): number => {

    if (showValues) {
        for (let i = 0; i < values.length; i++)
            console.log(`[${i + 1}] ${values[i]}`);

        console.log();
    }

    return inputNumConsole(false)(query, 1, values.length, false) - 1;
};

const clearLine = () => {

    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 0);

};

export enum IOMode {

    CONSOLE = 'CONSOLE'

}