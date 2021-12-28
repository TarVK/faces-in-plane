import {IPoint} from "../data/_types/IPoint";

/**
 * Checks whether the given two points are equivalent
 * @param p1 The first point to check
 * @param p2 The second point to check
 * @returns Whether the points are equal
 */
export function pointEquals(p1: IPoint, p2: IPoint): boolean {
    return p1.x == p2.x && p1.y == p2.y;
}
