import IKeyObject from './IKeyObject';
import Messages from './Messages.json';

const m = Messages as IKeyObject<string | string[]>;

const getMessage = (key: string) => {
    if (key in Messages)
        if (typeof m[key] === 'string')
            return m[key] as string;
        else
            return m[key][(Math.floor(Math.random() * m[key].length))];

    return 'undefined';
};

export default getMessage;