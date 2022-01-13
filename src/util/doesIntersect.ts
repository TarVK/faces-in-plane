import {ISegment} from "./_types/ISegment";
import {getSideOfLine} from "./getSideOfLine";

/**
 * Checks whether the two segments strictly intersect, I.e. have point on either side of the segments (not only overlap)
 * @param a The first segment to be used
 * @param b The second segment to be used
 * @returns Whether the segments cross
 */
export function doesIntersect(a: ISegment, b: ISegment): boolean {
    return (
        getSideOfLine(a, b.start) * getSideOfLine(a, b.end) < 0 &&
        getSideOfLine(b, a.start) * getSideOfLine(b, a.end) < 0
    );
}
