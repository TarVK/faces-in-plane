import {ISegment} from "../data/_types/ISegment";
import {getSideOfLine} from "./getSideOfLine";

/**
 * Checks whether the given segments intersect
 * @param segment1 The first segment
 * @param segment2 The second segment
 * @param strict Whether to check strict intersection, or also include shared points
 * @returns Whether the given segments intersect
 */
export function doesIntersect(
    segment1: ISegment,
    segment2: ISegment,
    strict: boolean = true
): boolean {
    const i1 =
        getSideOfLine(segment1, segment2.start) * getSideOfLine(segment1, segment2.end);
    const i2 =
        getSideOfLine(segment2, segment1.start) * getSideOfLine(segment2, segment1.end);
    return strict ? i1 < 0 && i2 < 0 : i1 <= 0 && i2 <= 0;
}
