import { IPoint } from "./_types/IPoint";
import { ISegment } from "./_types/ISegment";
import { Side } from "./Side";
/**
 * Checks whether r lies to the left (-1), right (1) or on (0) segment pq.
 * @param segment The segment to check
 * @param r The point to check
 * @returns The side that the point is on
 */
export declare function getSideOfLine({ start, end }: ISegment, r: IPoint): Side;
//# sourceMappingURL=getSideOfLine.d.ts.map