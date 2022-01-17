import {IPoint} from "face-combiner";

/**
 * Computes the distance between the two given points
 * @param p1
 * @param p2
 * @returns The distance between the points
 */
export function getDistance(p1: IPoint, p2: IPoint): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}
