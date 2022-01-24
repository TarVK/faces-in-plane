import {IJSON} from "./_types/IJSON";

export const jsonEquals = (a: IJSON, b: IJSON): a is typeof b => {
    if (a instanceof Array) {
        if (!(b instanceof Array)) return false;
        if (a.length != b.length) return false;
        for (let i = 0; i < a.length; i++) if (!jsonEquals(a[i], b[i])) return false;

        return true;
    } else if (a instanceof Object) {
        if (!(b instanceof Object) || b instanceof Array) return false;
        const aKeys = Object.keys(a);
        if (aKeys.length != Object.keys(b).length) return false;

        for (let key of aKeys) if (!jsonEquals(a[key], b[key])) return false;
        return true;
    } else {
        return a === b;
    }
};
