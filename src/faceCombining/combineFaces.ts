import {IFace} from "../data/_types/IFace";
import {IPoint} from "../data/_types/IPoint";
import {ISegment} from "../data/_types/ISegment";
import {ISimplePolygon} from "../data/_types/ISimplePolygon";
import {BalancedSearchTree} from "../utils/BalancedSearchTree";
import {getSideOfLine} from "../utils/getSideOfLine";
import {getSideOfPoint} from "../utils/getSideOfPoint";
import {pointEquals} from "../utils/pointEquals";
import {Side} from "../utils/Side";
import {getFaceEvents} from "./getFaceEvents";
import {
    ICrossEvent,
    IEvent,
    ILeftContinueEvent,
    IMergeEvent,
    IRightContinueEvent,
    ISplitEvent,
    IStartEvent,
    IStopEvent,
} from "./_types/IEvents";
import {IFaceSource} from "./_types/IFaceSource";
import {IBoundary, IInterval} from "./_types/IInterval";
import {IMonotonePolygonSection} from "./_types/IMonotonePolygonSection";

/**
 * Takes a set of faces whose edges may cross, and combines them into a set of non-crossing polygons that retain the same information
 * @param faces The faces the be combined
 * @returns The combined faces
 */
export function combineFaces<F extends IFace<any>>(faces: F[]): IFace<F[]>[] {
    // Sort events increasingly, lexicographically on y, then x coordinates, then prioritize stop over start.
    const eventPrios = {
        // Lower prio means handled earlier
        stop: 0,
        merge: 0,
        cross: 1,
        leftContinue: 2,
        rightContinue: 2,
        start: 3,
        split: 3,
    };
    const events = new BalancedSearchTree<IEvent<F>>((pa, pb) => {
        const {type: ta, point: a} = pa,
            {type: tb, point: b} = pb;
        if (a.y != b.y) return a.y - b.y;
        if (a.x != b.x) return a.x - b.x;

        const aPrio = eventPrios[ta];
        const bPrio = eventPrios[tb];
        if (aPrio != bPrio) {
            if (aPrio < bPrio) return -1;
            else return 1;
        } else if (
            (pa.type == "start" || pa.type == "split") &&
            (pb.type == "start" || pb.type == "split")
        ) {
            // Sort start/splits from left to right
            const lineSide = getSideOfLine({start: a, end: pb.left}, pa.left);
            if (lineSide == Side.left) return -1;
            else if (lineSide == Side.right) return 1;
        }
        return 0;
    });

    for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        const faceEvents = getFaceEvents(face, i);
        for (let faceEvent of faceEvents) events.insert(faceEvent);
    }

    // Perform the scanline sweep
    const scanLine = new BalancedSearchTree<IInterval<F>>(({left: a}, {left: b}) => {
        if (!a) return -1;
        if (!b) return 1;

        const aStartSide = getSideOfLine(b, a.start);
        if (aStartSide == Side.left) return -1;
        if (aStartSide == Side.right) return 1;

        const aEndSide = getSideOfLine(b, a.end);
        if (aEndSide == Side.left) return -1;
        if (aEndSide == Side.right) return 1;

        return a.source.id - b.source.id;
    });
    const outerInterval: IInterval<F> = {
        shape: {
            left: [],
            right: [],
            sources: [],
        },
        sources: [],
    };
    scanLine.insert(outerInterval);
    const startSections = new Set<IMonotonePolygonSection<F>>();

    let event: IEvent<F> | undefined = events.getMin();
    if (!event) return [];
    events.delete(event);

    let point: IPoint | undefined = event.point;
    let eventsAtPoint: Exclude<IEvent<F>, ICrossEvent<F>>[] = [
        event as Exclude<IEvent<F>, ICrossEvent<F>>,
    ]; // First event can't be a cross event, since no such event can be generated yet

    while ((event = events.getMin())) {
        events.delete(event);
        if (event.type == "cross") handleCrossEvent(event, scanLine, events);
        else {
            if (!pointEquals(point, event.point)) {
                handleEvents(eventsAtPoint, scanLine, startSections, events);
                eventsAtPoint = [event];
                point = event.point;
            }
            eventsAtPoint.push(event);
        }
    }
    if (eventsAtPoint.length > 0)
        handleEvents(eventsAtPoint, scanLine, startSections, events);

    return generateFaces(startSections);
}

/**
 * Returns a function that can be used to query the scanline for a given segment
 * @param segment The segment to be found
 * @returns The function to query the scanline with
 */
const findInterval: <F extends IFace<any>>(
    segment: ISegment
) => (i: IInterval<F>) => -1 | 0 | 1 =
    ({start, end}) =>
    i => {
        let onLeft = false; // Whether the start point lies on the left of the interval
        let onRight = false; // Whether the start point lies on the right of the interval
        if (!i.left && i.right) {
            const side = getSideOfLine(i.right, start);
            if (side == Side.left) return 0;
            if (side == Side.right) return 1;
            onRight = true;
        } else if (i.left && !i.right) {
            const side = getSideOfLine(i.left, start);
            if (side == Side.left) return -1;
            if (side == Side.right) return 0;
            onLeft = true;
        } else if (!i.left || !i.right) {
            return 0; // This case shouldn't be reachable
        } else {
            const leftSide = getSideOfLine(i.left, start);
            if (leftSide == Side.left) return -1;
            if (leftSide == Side.on) onLeft = true;

            const rightSide = getSideOfLine(i.right, start);
            if (rightSide == Side.right) return 1;
            if (rightSide == Side.on) onRight = true;

            if (leftSide == Side.right && rightSide == Side.left) return 0;
        }

        // The start point lies on a boundary, check if the endpoint goes in/through the boundary
        if (i.left && onLeft) {
            const side = getSideOfLine(i.left, end);
            if (side == Side.left) return -1;
        }
        if (i.right && onRight) {
            const side = getSideOfLine(i.right, end);
            if (side == Side.right) return 1;
        }
        return 0;
    };

/**
 * Retrieves the intersection point of the line extensions of the given segments
 * @param a The first segment to use
 * @param b The second segment to use
 * @returns The intersection point of the two lines
 */
function getIntersectionPoint(a: ISegment, b: ISegment): IPoint {
    const dxA = a.start.x - a.end.x;
    const slopeA = (a.start.y - a.end.y) / dxA;
    const interceptA = a.start.y - slopeA * a.start.x;
    const dxB = b.start.x - b.end.x;
    const slopeB = (b.start.y - b.end.y) / dxB;
    const interceptB = b.start.y - slopeB * b.start.x;

    if (dxA == 0)
        return {
            x: a.start.x,
            y: slopeB * a.start.x + interceptB,
        };
    if (dxB == 0)
        return {
            x: b.start.x,
            y: slopeA * b.start.x + interceptA,
        };

    const x = (interceptA - interceptB) / (slopeA - slopeB);
    const y = slopeA * x + interceptA;
    return {x, y};
}

/**
 * Checks whether the two segments strictly intersect, I.e. have point on either side of the segments (not only overlap)
 * @param a The first segment to be used
 * @param b The second segment to be used
 * @returns Whether the segments cross
 */
function doesIntersect(a: ISegment, b: ISegment): boolean {
    return (
        getSideOfLine(a, b.start) * getSideOfLine(a, b.end) < 0 &&
        getSideOfLine(b, a.start) * getSideOfLine(b, a.end) < 0
    );
}

/**
 * Checks what side a is on in respect to b
 * @param a The line segment to get the side of
 * @param b The segment to get the side relative to
 * @returns The side of line segment a (based on the start point of `a` in case of crossing)
 */
function getLineSideOfLine(a: ISegment, b: ISegment): Side {
    const startSide = getSideOfLine(b, a.start);
    if (startSide != Side.on) return startSide;
    const endSide = getSideOfLine(b, a.end);
    return endSide;
}

/**
 * Sorts the given boundaries from left to right
 * @param boundaries The boundaries to be sorted
 * @returns The sorted boundaries
 */
function sortBoundaries<F extends IFace<any>>(
    boundaries: IBoundary<F>[]
): IBoundary<F>[] {
    const sorted = [...boundaries];
    sorted.sort((a, b) => {
        const side = getLineSideOfLine(a, b);
        if (side == Side.on) return a.source.id - b.source.id;
        return side;
    });
    return sorted;
}

/**
 * Augments the given sources as would happen when crossing its boundary from left to right with the given data
 * @param sources The sources to be augment
 * @param boundary THe boundary to be crossed
 * @returns The augmented sources
 */
function augmentSources<F extends IFace<any>>(
    sources: IFaceSource<F>[],
    boundary: IBoundary<F>
): IFaceSource<F>[] {
    if (boundary.side == "left") return [...sources, boundary.source];
    else return sources.filter(el => el != boundary.source);
}

/**
 * Splits all the boundaries of intervals that the given point goes through
 * @param point The point to be checked for
 * @param bottomBoundaries The bottom boundaries that are being removed
 * @param scanLine The scanline that the boundaries are on
 * @returns The tops of the cut-off boundaries
 */
function getContinuationsThroughPoint<F extends IFace<any>>(
    point: IPoint,
    bottomBoundaries: IBoundary<F>[],
    scanLine: BalancedSearchTree<IInterval<F>>
): IBoundary<F>[] {
    const cutOff: IBoundary<F>[] = [];

    let intervals: IInterval<F>[];
    if (bottomBoundaries.length >= 2) {
        let leftBoundary: IBoundary<F> | undefined;
        let rightBoundary: IBoundary<F> | undefined;
        for (let boundary of bottomBoundaries) {
            if (!leftBoundary || getLineSideOfLine(boundary, leftBoundary) == Side.left)
                leftBoundary = boundary;
            if (
                !rightBoundary ||
                getLineSideOfLine(boundary, rightBoundary) == Side.right
            )
                rightBoundary = boundary;
        }
        intervals = scanLine.findRange(
            findInterval(leftBoundary!),
            findInterval(rightBoundary!)
        );
    } else {
        const query = findInterval({start: point, end: point});
        intervals = scanLine.findRange(query, query);
    }
    if (intervals.length < 1)
        throw new Error(`Reached unreachable state 1: ${JSON.stringify(point)}`);

    let prevInterval: IInterval<F> = intervals[0];
    const endIntervals = intervals.slice(1);
    for (let interval of endIntervals) {
        if (interval.left && interval.left.end != point) {
            const newBoundary: IBoundary<F> = {
                ...interval.left,
                start: point,
            };
            cutOff.push(newBoundary);

            prevInterval.right = interval.left = {
                ...interval.left,
                end: point,
            };
        }
        prevInterval = interval;
    }
    return cutOff;
}

/**
 * Removes all the given boundaries from the intervals on the scan line
 * @param point The point in which the boundaries to be removed end
 * @param scanLine The scanline that the boundaries are on
 * @returns The left and right most removed intervals
 */
function removeBoundariesAtPoint<F extends IFace<any>>(
    point: IPoint,
    scanLine: BalancedSearchTree<IInterval<F>>
): {leftInterval: IInterval<F>; rightInterval: IInterval<F>} {
    const query = findInterval({start: point, end: point});
    const intervals = scanLine.findRange(query, query);
    if (intervals.length < 1)
        throw new Error(`Reached unreachable state 2: ${JSON.stringify(point)}`);

    const innerIntervals = intervals.slice(1, -1);
    for (let interval of innerIntervals) {
        interval.shape.left.push(point);
        interval.shape.right.push(point);
        scanLine.delete(interval);
    }

    const leftInterval = intervals[0];
    const rightInterval = intervals[intervals.length - 1];

    // If more than 1 interval was found, the point lies on an edge which should be broken
    if (intervals.length > 1) {
        if (leftInterval.right) leftInterval.shape.right.push(leftInterval.right.end);
        if (rightInterval.left) rightInterval.shape.left.push(rightInterval.left.end);
    }

    return {leftInterval, rightInterval};
}

/**
 * Adds the inner intervals for the given boundaries
 * @param boundaries The boundaries that form a new polygon section
 * @param scanLine The scanline to add the new intervals to
 * @param startSources The sources of the interval to the left of left most boundary
 * @param output The output to add the new polygon sections to
 * @returns The left and right most boundaries
 */
function addBoundariesInnerIntervals<F extends IFace<any>>(
    boundaries: IBoundary<F>[],
    scanLine: BalancedSearchTree<IInterval<F>>,
    startSources: IFaceSource<F>[],
    output: Set<IMonotonePolygonSection<F>>
): {leftBoundary: IBoundary<F>; rightBoundary: IBoundary<F>} {
    const point = boundaries[0].start; // The start points are all the same
    const sortedBoundaries = sortBoundaries(boundaries);
    const endBoundaries = sortedBoundaries.slice(1);

    let prevBoundary = sortedBoundaries[0];
    let sources = startSources;
    for (let boundary of endBoundaries) {
        sources = augmentSources(sources, prevBoundary);

        const newShape: IMonotonePolygonSection<F> = {
            sources,
            left: [point],
            right: [point],
        };
        const newInterval: IInterval<F> = {
            left: prevBoundary,
            right: boundary,
            sources,
            shape: newShape,
        };
        output.add(newShape);
        scanLine.insert(newInterval);

        prevBoundary = boundary;
    }

    return {
        leftBoundary: sortedBoundaries[0],
        rightBoundary: sortedBoundaries[sortedBoundaries.length - 1],
    };
}

/**
 * Handles the polygon events at a specific point
 * @param events All the polygon events with the same x and y coordinate
 * @param scanLine The scanline that the intervals are on
 * @param output The output set of polygon sections
 * @param eventQueue The event queue to add cross events to
 */
function handleEvents<F extends IFace<any>>(
    events: (
        | IStartEvent<F>
        | IStopEvent<F>
        | ISplitEvent<F>
        | IMergeEvent<F>
        | ILeftContinueEvent<F>
        | IRightContinueEvent<F>
    )[],
    scanLine: BalancedSearchTree<IInterval<F>>,
    output: Set<IMonotonePolygonSection<F>>,
    eventQueue: BalancedSearchTree<IEvent<F>>
): void {
    // Unify the data of different event types
    const point = events[0].point; // All points are the same
    const oldEventBoundaries = events.flatMap<IBoundary<F>>(event => {
        const {point, source} = event;
        if (event.type == "stop")
            return [
                {start: event.left, end: point, side: "left", source},
                {start: event.right, end: point, side: "right", source},
            ];
        if (event.type == "merge")
            return [
                {start: event.left, end: point, side: "right", source},
                {start: event.right, end: point, side: "left", source},
            ];
        if (event.type == "leftContinue")
            return [{start: event.prev, end: point, side: "left", source}];
        if (event.type == "rightContinue")
            return [{start: event.prev, end: point, side: "right", source}];
        return [];
    });
    const newEventBoundaries = events.flatMap<IBoundary<F>>(event => {
        const {point, source} = event;
        if (event.type == "start")
            return [
                {start: point, end: event.left, side: "left", source},
                {start: point, end: event.right, side: "right", source},
            ];
        if (event.type == "split")
            return [
                {start: point, end: event.right, side: "left", source},
                {start: point, end: event.left, side: "right", source},
            ];
        if (event.type == "leftContinue")
            return [{start: point, end: event.next, side: "left", source}];
        if (event.type == "rightContinue")
            return [{start: point, end: event.next, side: "right", source}];
        return [];
    });

    // Retrieve lines that go through the even point
    const extraNewBoundaries = getContinuationsThroughPoint(
        point,
        oldEventBoundaries,
        scanLine
    );

    // Remove
    const {leftInterval, rightInterval} = removeBoundariesAtPoint(point, scanLine);

    const allNewBoundaries = [...newEventBoundaries, ...extraNewBoundaries];

    if (allNewBoundaries.length > 0) {
        const {leftBoundary, rightBoundary} = addBoundariesInnerIntervals(
            allNewBoundaries,
            scanLine,
            leftInterval.sources,
            output
        );
        const {shape: lis} = leftInterval;
        const {left: lsl, right: lsr} = lis;
        const newLeftInterval: IInterval<F> = {
            ...leftInterval,
            right: leftBoundary,
            shape: {
                sources: leftInterval.sources,
                left: lsl.length == 0 ? [] : [lsl[lsl.length - 1]],
                right: [point],
                bottomLeft: lis,
            },
        };

        const {shape: ris} = rightInterval;
        const {left: rsl, right: rsr} = ris;
        const newRightInterval: IInterval<F> = {
            ...rightInterval,
            left: rightBoundary,
            shape: {
                sources: rightInterval.sources,
                left: [point],
                right: rsr.length == 0 ? [] : [rsr[rsr.length - 1]],
                bottomRight: ris,
            },
        };

        lis.topLeft = newLeftInterval.shape;
        ris.topRight = newRightInterval.shape;
        scanLine.insert(newLeftInterval);
        scanLine.insert(newRightInterval);

        // Check for line intersections, and note that it's impossible to intersect any of the internal boundaries such that they don't have to be checked
        if (leftInterval.left && doesIntersect(leftInterval.left, leftBoundary)) {
            const intersect = getIntersectionPoint(leftInterval.left, leftBoundary);
            const crossEvent: ICrossEvent<F> = {
                type: "cross",
                interval: newLeftInterval,
                point: intersect,
            };
            eventQueue.insert(crossEvent);
        }
        if (rightInterval.right && doesIntersect(rightBoundary, rightInterval.right)) {
            const intersect = getIntersectionPoint(rightBoundary, rightInterval.right);
            const crossEvent: ICrossEvent<F> = {
                type: "cross",
                interval: newRightInterval,
                point: intersect,
            };
            eventQueue.insert(crossEvent);
        }
    } else {
        const {shape: lis, left, sources} = leftInterval;
        const {shape: ris, right} = rightInterval;
        const newInterval: IInterval<F> = {
            left,
            right,
            sources,
            shape: {
                sources: leftInterval.sources,
                left: [point],
                right: [point],
                bottomLeft: lis,
                bottomRight: ris,
            },
        };
        scanLine.insert(newInterval);

        // Check for line intersections, and note that it's impossible to intersect any of the internal boundaries such that they don't have to be checked
        if (left && right && doesIntersect(left, right)) {
            const intersect = getIntersectionPoint(left, right);
            const crossEvent: ICrossEvent<F> = {
                type: "cross",
                interval: newInterval,
                point: intersect,
            };
            eventQueue.insert(crossEvent);
        }
    }
}

/**
 * Handles the cross event by splitting the affected segments and adding continuation events to the queue
 * @param event The intersection event
 * @param scanLine The scanline that the affected intervals are on
 * @param eventQueue The queue of events to add the continuation events to
 */
function handleCrossEvent<F extends IFace<any>>(
    event: ICrossEvent<F>,
    scanLine: BalancedSearchTree<IInterval<F>>,
    eventQueue: BalancedSearchTree<IEvent<F>>
): void {
    const {
        interval: {left: leftSegment, right: rightSegment},
        point,
    } = event;
    if (!leftSegment || !rightSegment)
        throw new Error(`Reached unreachable state 3: ${JSON.stringify(event)}`);

    const leftQuery = findInterval(leftSegment);
    const leftIntervals = scanLine.findRange(leftQuery, leftQuery);
    if (leftIntervals.length < 2)
        throw new Error(`Reached unreachable state 4: ${JSON.stringify(leftSegment)}`);

    const rightQuery = findInterval(rightSegment);
    const rightIntervals = scanLine.findRange(rightQuery, rightQuery);
    if (rightIntervals.length < 2)
        throw new Error(`Reached unreachable state 5: ${JSON.stringify(rightSegment)}`);

    // Split all left intervals
    let prevInterval = leftIntervals[0];
    let endIntervals = leftIntervals.slice(1);
    for (let leftInterval of endIntervals) {
        const {left} = leftInterval;
        if (left && left.end != point) {
            const next = left.end,
                prev = left.start,
                source = left.source;
            left.end = point;
            const newEvent: ILeftContinueEvent<F> | IRightContinueEvent<F> =
                left.side == "left"
                    ? {type: "leftContinue", prev, next, point, source}
                    : {type: "rightContinue", prev, next, point, source};
            eventQueue.insert(newEvent);
        }

        prevInterval = leftInterval;
    }

    // Split all right intervals
    prevInterval = rightIntervals[0];
    endIntervals = rightIntervals.slice(1);
    for (let rightInterval of endIntervals) {
        const {right} = rightInterval;
        if (right && right.end != point) {
            const next = right.end,
                prev = right.start,
                source = right.source;
            right.end = point;
            const newEvent: ILeftContinueEvent<F> | IRightContinueEvent<F> =
                right.side == "left"
                    ? {type: "leftContinue", prev, next, point, source}
                    : {type: "rightContinue", prev, next, point, source};
            eventQueue.insert(newEvent);
        }

        prevInterval = rightInterval;
    }
}

/**
 * Generates the full list of polygons given a set of sections
 * @param sections The sections of the faces. Note: multiple sections of the same face my be present
 * @returns The generated faces
 */
function generateFaces<F extends IFace<any>>(
    sections: Set<IMonotonePolygonSection<F>>
): IFace<F[]>[] {
    const output: IFace<F[]>[] = [];
    for (let section of sections) {
        const points: IPoint[] = [];
        exploreSection(section, undefined, sections, points);

        const face: IFace<F[]> = {
            data: section.sources.map(({face}) => face),
            polygon: points,
        };
        output.push(face);
    }

    return output;
}

/**
 * Recursively explorers a given section and adds the found points to the list
 * @param section The section to be explored
 * @param parent The parent to not backtrack into
 * @param output The list of points to output
 */
function exploreSection<F extends IFace<any>>(
    section: IMonotonePolygonSection<F>,
    parent: IMonotonePolygonSection<F> | undefined,
    remainingSections: Set<IMonotonePolygonSection<F>>,
    output: IPoint[]
): void {
    remainingSections.delete(section);

    let start = 0;
    if (parent) {
        if (section.topLeft == parent) start = 0;
        else if (section.bottomLeft == parent) start = 1;
        else if (section.bottomRight == parent) start = 2;
        else if (section.topRight == parent) start = 3;
    }

    for (let i = 0; i < 4; i++) {
        const side = (i + start) % 4;
        if (!(i == 0 && parent)) {
            if (side == 0) {
                if (section.topLeft)
                    exploreSection(section.topLeft, parent, remainingSections, output);
            } else if (side == 1) {
                if (section.bottomLeft)
                    exploreSection(section.bottomLeft, parent, remainingSections, output);
            } else if (side == 2) {
                if (section.bottomRight)
                    exploreSection(
                        section.bottomRight,
                        parent,
                        remainingSections,
                        output
                    );
            } else if (side == 3) {
                if (section.topRight)
                    exploreSection(section.topRight, parent, remainingSections, output);
            }
        }

        if (side == 0) {
            output.push(...section.left.slice(1).reverse());
        } else if (side == 2) {
            output.push(...section.right.slice(1));
        }
    }
}
