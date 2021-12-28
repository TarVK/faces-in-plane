import {IPoint} from "../data/_types/IPoint";
import {ISegment} from "../data/_types/ISegment";
import {Side} from "./Side";

/**
 * Checks whether r lies to the left (-1), right (1) or on (0) segment pq.
 * @param segment The segment to check
 * @param r The point to check
 * @returns The side that the point is on
 */
export function getSideOfLine({start, end}: ISegment, r: IPoint): Side {
    const res = (end.x - start.x) * (r.y - start.y) - (end.y - start.y) * (r.x - start.x);
    return res < 0 ? Side.right : res > 0 ? Side.left : Side.on;
}
