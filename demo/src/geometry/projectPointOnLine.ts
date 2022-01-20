import {IPoint, ISegment} from "face-combiner";

/**
 * Finds the point on the given line segment closest to the input point
 * @param point The point to project
 * @param line The line to project the point onto
 * @returns The projected point
 */
export function projectPointOnLine(point: IPoint, line: ISegment): IPoint {
    const {start: p1, end: p2} = line;

    const dxA = point.x - p1.x;
    const dyA = point.y - p1.y;

    const dxB = p2.x - p1.x;
    const dyB = p2.y - p1.y;

    const dist = dxB * dxB + dyB * dyB;
    const product = dxA * dxB + dyA * dyB;
    const projDistance = product / dist;
    if (projDistance < 0) return p1;
    if (projDistance > 1) return p2;

    return {
        x: p1.x + dxB * projDistance,
        y: p1.y + dyB * projDistance,
    };
}
