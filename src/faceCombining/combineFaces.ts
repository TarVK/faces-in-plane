import {IFace} from "../data/_types/IFace";
import {IPoint} from "../data/_types/IPoint";
import {ISegment} from "../data/_types/ISegment";
import {ISimplePolygon} from "../data/_types/ISimplePolygon";
import {BalancedSearchTree} from "../utils/BalancedSearchTree";
import {doesIntersect} from "../utils/doesIntersect";
import {getSideOfLine} from "../utils/getSideOfLine";
import {getSideOfPoint} from "../utils/getSideOfPoint";
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
import {IBoundary, IInterval} from "./_types/IInterval";
import {IMonotonePolygonSection} from "./_types/IMonotonePolygonSection";

/**
 * Takes a set of faces whose edges may cross, and combines them into a set of non-crossing polygons that retain the same information
 * @param faces The faces the be combined
 * @returns The combined faces
 */
export function combineFaces<D>(faces: IFace<D>[]): IFace<D[]>[] {
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
    const events = new BalancedSearchTree<IEvent<D>>((pa, pb) => {
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

    for (let face of faces) {
        const faceEvents = getFaceEvents(face);
        for (let faceEvent of faceEvents) events.insert(faceEvent);
    }

    // Perform the scanline sweep
    const scanLine = new BalancedSearchTree<IInterval<D>>(({left: a}, {left: b}) => {
        if (!a) return -1;
        if (!b) return 1;

        const aStartSide = getSideOfLine(b, a.start);
        if (aStartSide == Side.left) return -1;
        if (aStartSide == Side.right) return 1;

        const aEndSide = getSideOfLine(b, a.end);
        if (aEndSide == Side.left) return -1;
        if (aEndSide == Side.right) return 1;
        return 0;
    });
    const outerInterval: IInterval<D> = {
        shape: {
            left: [],
            right: [],
            data: [],
        },
        data: [],
    };
    scanLine.insert(outerInterval);
    const startSections = new Set<IMonotonePolygonSection<D>>();

    let event: IEvent<D> | undefined;
    while ((event = events.getMin())) {
        events.delete(event);
        if (event.type == "start")
            handleStartAndSplit(event, scanLine, startSections, events);
        else if (event.type == "leftContinue") handleContinue();
    }
}

/**
 * Returns a function that can be used to query the scanline for a given segment
 * @param segment The segment to be found
 * @returns The function to query the scanline with
 */
const findInterval: <D>(segment: ISegment) => (i: IInterval<D>) => -1 | 0 | 1 =
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
function sortBoundaries<D>(boundaries: IBoundary<D>[]): IBoundary<D>[] {
    const sorted = [...boundaries];
    sorted.sort(getLineSideOfLine);
    return sorted;
}

/**
 * Augments the given data as would happen when crossing its boundary from left to right with the given data
 * @param data The data to be augment
 * @param boundary THe boundary to be crossed
 * @returns The augmented data
 */
function augmentData<D>(data: D[], boundary: IBoundary<D>): D[] {
    if (boundary.side == "left") return [...data, boundary.data];
    else return data.filter(el => el != boundary.data);
}

/**
 * Handles the start/split event of a polygon
 * @param events The start/split events at this point (shares same x and y coordinates)
 * @param scanLine The scanline
 * @param output The output to accumulate start pieces of output polygons into
 * @param eventQueue The event queue to add new possible future events into
 */
function handleStartAndSplit<D>(
    events: (IStartEvent<D> | ISplitEvent<D>)[],
    scanLine: BalancedSearchTree<IInterval<D>>,
    output: Set<IMonotonePolygonSection<D>>,
    eventQueue: BalancedSearchTree<IEvent<D>>
): void {
    const point = events[0].point; // Point is the same for all events
    const eventBoundaries = events.flatMap<IBoundary<D>>( // 2+ boundaries
        ({point, left, right, type, data}) =>
            type == "start"
                ? [
                      {start: point, end: left, side: "left", data},
                      {start: point, end: right, side: "right", data},
                  ]
                : [
                      {start: point, end: left, side: "right", data},
                      {start: point, end: right, side: "left", data},
                  ]
    );
    const sortedEventBoundaries = sortBoundaries(eventBoundaries);

    const startBoundary = sortedEventBoundaries[0];
    const endBoundary = sortedEventBoundaries[sortedEventBoundaries.length - 1];

    const intervals = scanLine.findRange(
        findInterval(startBoundary),
        findInterval(endBoundary)
    );

    if (intervals.length < 1)
        throw new Error(
            `Reached unreachable state 1: ${JSON.stringify(
                eventBoundaries.map(({start, end}) => ({start, end}))
            )}`
        );

    for (let interval of intervals) scanLine.delete(interval);

    // In most cases leftInterval==rightIntervals, but they may be different if lines start in the same point
    const leftInterval = intervals[0];
    const rightInterval = intervals[intervals.length - 1];

    // Create the new intervals outside the started polygon
    const {shape: lis} = leftInterval;
    const {left: lsl, right: lsr} = lis;
    const newLeftInterval: IInterval<D> = {
        ...leftInterval,
        right: startBoundary,
        shape: {
            data: leftInterval.data,
            left: lsl.length == 0 ? [] : [lsl[lsl.length - 1]],
            right: [point],
            bottomLeft: lis,
        },
    };

    const {shape: ris} = rightInterval;
    const {left: rsl, right: rsr} = ris;
    const newRightInterval: IInterval<D> = {
        ...rightInterval,
        left: endBoundary,
        shape: {
            data: rightInterval.data,
            left: [point],
            right: rsr.length == 0 ? [] : [rsr[rsr.length - 1]],
            bottomRight: ris,
        },
    };

    lis.topLeft = newLeftInterval.shape;
    ris.topRight = newRightInterval.shape;
    scanLine.insert(newLeftInterval);
    scanLine.insert(newRightInterval);

    // Create the new intervals inside the started polygons
    const endIntervals = intervals.slice(1);
    const middleIntervals = endIntervals.slice(0, -1);
    middleIntervals.forEach(({shape}) => output.delete(shape)); // These shapes must have started in this point, but are replaced because of this event

    const innerCrossedBoundaries = endIntervals
        .map(({left}) => left)
        .filter((b): b is IBoundary<D> => !!b);
    const allInnerBoundaries = [
        ...sortedEventBoundaries.slice(1), // Only skip the first boundary
        ...innerCrossedBoundaries,
    ];
    const allSortedInnerBoundaries = sortBoundaries(allInnerBoundaries);

    let prevBoundary = startBoundary;
    let data = leftInterval.data;
    for (let boundary of allSortedInnerBoundaries) {
        data = augmentData(data, prevBoundary);

        const newShape: IMonotonePolygonSection<D> = {
            data,
            left: [point],
            right: [point],
        };
        const newInterval: IInterval<D> = {
            left: prevBoundary,
            right: boundary,
            data,
            shape: newShape,
        };
        output.add(newShape);
        scanLine.insert(newInterval);

        prevBoundary = boundary;
    }

    // Check for line intersections, and note that it's impossible to intersect any of the internal boundaries such that they don't have to be checked
    if (leftInterval.left && doesIntersect(leftInterval.left, startBoundary, true)) {
        const intersect = getIntersectionPoint(leftInterval.left, startBoundary);
        const crossEvent: ICrossEvent = {
            type: "cross",
            left: leftInterval.left.start,
            right: startBoundary.start,
            point: intersect,
        };
        eventQueue.insert(crossEvent);
    }
    if (rightInterval.right && doesIntersect(endBoundary, rightInterval.right, true)) {
        const intersect = getIntersectionPoint(endBoundary, rightInterval.right);
        const crossEvent: ICrossEvent = {
            type: "cross",
            left: endBoundary.start,
            right: rightInterval.right.start,
            point: intersect,
        };
        eventQueue.insert(crossEvent);
    }
}

/**
 * Handles the edge continue events
 * @param events The right/left continue events at this point (shares same x and y coordinates)
 * @param scanLine The scanline
 * @param output The output to accumulate start pieces of output polygons into
 * @param eventQueue The event queue to add new possible future events into
 */
function handleContinue<D>(
    events: (ILeftContinueEvent<D> | IRightContinueEvent<D>)[],
    scanLine: BalancedSearchTree<IInterval<D>>,
    output: Set<IMonotonePolygonSection<D>>,
    eventQueue: BalancedSearchTree<IEvent<D>>
): void {
    const point = events[0].point; // Point is the same for all events

    // Retrieve the old boundaries and intervals
    const eventOldBoundaries = events.map<IBoundary<D>>( // 1+ boundaries
        ({point, prev, next, type, data}) => ({
            start: prev,
            end: point,
            side: type == "leftContinue" ? "left" : "right",
            data,
        })
    );
    const sortedEventOldBoundaries = sortBoundaries(eventOldBoundaries);
    const startOldBoundary = sortedEventOldBoundaries[0];
    const endOldBoundary = sortedEventOldBoundaries[sortedEventOldBoundaries.length - 1];

    const intervals = scanLine.findRange(
        findInterval(startOldBoundary),
        findInterval(endOldBoundary)
    );

    if (intervals.length < 2)
        throw new Error(
            `Reached unreachable state 2: ${JSON.stringify(
                sortedEventOldBoundaries.map(({start, end}) => ({start, end}))
            )}`
        );

    // Remove the old inner intervals
    const oldInnerIntervals = intervals.slice(1, -1);
    for (let interval of oldInnerIntervals) {
        interval.shape.left.push(point);
        interval.shape.right.push(point);
        scanLine.delete(interval);
    }

    // Retrieve the new boundaries
    const eventNewBoundaries = events.map<IBoundary<D>>( // 1+ boundaries
        ({point, prev, next, type, data}) => ({
            start: point,
            end: next,
            side: type == "leftContinue" ? "left" : "right",
            data,
        })
    );
    const sortedEventNewBoundaries = sortBoundaries(eventNewBoundaries);
    const startNewBoundary = sortedEventNewBoundaries[0];
    const endNewBoundary = sortedEventNewBoundaries[sortedEventNewBoundaries.length - 1];

    // Update the side intervals
    const leftInterval = intervals[0];
    const rightInterval = intervals[intervals.length - 1];

    if (leftInterval.right) leftInterval.shape.right.push(leftInterval.right.end);
    leftInterval.right = startNewBoundary;

    if (rightInterval.left) rightInterval.shape.left.push(rightInterval.left.end);
    leftInterval.left = endNewBoundary;

    // Create the new middle intervals
    const sortedInnerBoundaries = sortedEventNewBoundaries.slice(1);

    let prevBoundary = startNewBoundary;
    let data = leftInterval.data;
    for (let boundary of sortedInnerBoundaries) {
        data = augmentData(data, prevBoundary);

        const newShape: IMonotonePolygonSection<D> = {
            data,
            left: [point],
            right: [point],
        };
        const newInterval: IInterval<D> = {
            left: prevBoundary,
            right: boundary,
            data,
            shape: newShape,
        };
        output.add(newShape);
        scanLine.insert(newInterval);

        prevBoundary = boundary;
    }

    // Check for line intersections, and note that it's impossible to intersect any of the internal boundaries such that they don't have to be checked
    if (leftInterval.left && doesIntersect(leftInterval.left, startNewBoundary, true)) {
        const intersect = getIntersectionPoint(leftInterval.left, startNewBoundary);
        const crossEvent: ICrossEvent = {
            type: "cross",
            left: leftInterval.left.start,
            right: startNewBoundary.start,
            point: intersect,
        };
        eventQueue.insert(crossEvent);
    }
    if (rightInterval.right && doesIntersect(endNewBoundary, rightInterval.right, true)) {
        const intersect = getIntersectionPoint(endNewBoundary, rightInterval.right);
        const crossEvent: ICrossEvent = {
            type: "cross",
            left: endNewBoundary.start,
            right: rightInterval.right.start,
            point: intersect,
        };
        eventQueue.insert(crossEvent);
    }
}

/**
 * Handles the stop/merge events of a polygon
 * @param events The stop/merge events at this point (shares same x and y coordinates)
 * @param scanLine The scanline
 */
function handleStopAndMerge<D>(
    events: (IStopEvent<D> | IMergeEvent<D>)[],
    scanLine: BalancedSearchTree<IInterval<D>>
): void {
    const point = events[0].point; // Point is the same for all events

    const query = findInterval({start: point, end: point});
    const intervals = scanLine.findRange(query, query);
    if (intervals.length < 3)
        throw new Error(`Reached unreachable state 3: ${JSON.stringify(point)}`);

    for (let interval of intervals) scanLine.delete(interval);

    // Merge the outer intervals together
    const leftInterval = intervals[0];
    const rightInterval = intervals[intervals.length - 1];
    // const newInterval: IInterval;
    // TODO:
}
