import {IJSON} from "../geometry/editor/geometryCodeEditor/_types/IJSON";

/**
 * Checks whether a and b are value equivalent
 * @param a The first value to check
 * @param b The second value to check
 * @returns Whether the values are deep equal
 */
export function deepEquals(a: IJSON, b: IJSON): boolean {
    if (a instanceof Array) {
        if (!(b instanceof Array)) return false;
        if (a.length != b.length) return false;
        return a.every((v, i) => deepEquals(v, b[i]));
    }

    if (a instanceof Object) {
        if (!(b instanceof Object) || b instanceof Array) return false;
        if (Object.keys(a).length != Object.keys(b).length) return false;

        return Object.keys(a).every(k => deepEquals(a[k], b[k]));
    }

    return a == b;
}
