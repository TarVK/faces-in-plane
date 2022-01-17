import {getSideOfLine, IPoint, ISimplePolygon, Side} from "face-combiner";

/**
 * Checks whether the given point lies within the given polygon
 * @param point The point to be checked
 * @param polygon The polygon to be checked
 * @returns Whether the given point lies in the polygon
 */
export function isPointInPolygon(point: IPoint, polygon: ISimplePolygon): boolean {
    let crossedEven = true;

    let prev = polygon[polygon.length - 1];
    for (let next of polygon) {
        const outsideLineYRange =
            (point.y < prev.y && point.y < next.y) ||
            (point.y > prev.y && point.y > next.y);
        if (!outsideLineYRange) {
            const side = getSideOfLine(
                prev.y < next.y ? {start: prev, end: next} : {end: prev, start: next},
                point
            );
            if (side == Side.right) crossedEven = !crossedEven;
            // Only choose to cross the edge if we crossed an even number of lines, making edges inclusive
            if (side == Side.on && crossedEven) crossedEven = !crossedEven;
        }

        prev = next;
    }

    return !crossedEven;
}
