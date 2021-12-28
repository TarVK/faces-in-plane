import {IPoint} from "../data/_types/IPoint";

/**
 * Checks whether r lies to the left (-1) or right (1) (or on) the point.
 * @param p The side to check whether it's on the left or right
 * @param r The point to check
 * @returns The side that the point is on
 */
export function getSideOfPoint(p: IPoint, r: IPoint): -1 | 1 {
    return r.x < p.x ? -1 : 1;
}
