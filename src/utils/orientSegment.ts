import {ISegment} from "../data/_types/ISegment";

/**
 * Orients a segment such that the start point's x-coordinate is smaller or equal to the end point's
 * @param segment The segment to possibly reverse
 * @returns The oriented segment
 */
export function orientSegment(segment: ISegment): ISegment {
    const {start, end} = segment;
    return start.x > end.x || (start.x == end.x && start.y > end.y)
        ? {...segment, start: end, end: start}
        : segment;
}
