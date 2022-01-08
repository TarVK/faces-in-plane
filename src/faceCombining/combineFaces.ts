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
import {ICounter} from "./_types/ICounter";
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
    let id = 0;
    const eventIdCounter = () => id++;

    // Sort events increasingly, lexicographically on y, then x coordinates, then prioritize cross events.
    const events = new BalancedSearchTree<IEvent<F>>((pa, pb) => {
        const {type: ta, point: a, id: ida} = pa,
            {type: tb, point: b, id: idb} = pb;
        if (a.y != b.y) return a.y - b.y;
        if (a.x != b.x) return a.x - b.x;

        if (ta == "cross" && tb != "cross") return -1;
        if (ta != "cross" && tb == "cross") return 1;

        return ida - idb;
    });

    let eventStartId = 0;
    for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        const faceEvents = getFaceEvents(face, i, eventIdCounter);
        for (let faceEvent of faceEvents) events.insert(faceEvent);
        console.log(faceEvents);
        eventStartId += face.polygon.length;
    }

    // Perform the scanline sweep
    const scanLine = new BalancedSearchTree<IInterval<F>>(({left: a}, {left: b}) => {
        if (!a && !b) return 0; // There is only 1 interval with no  left boundary on any scanline
        if (!a) return -1;
        if (!b) return 1;

        // Compare from the perspective of the start point furthest up,
        // since the lower point may have been calculated to be the intersection of the lines through segments a and b
        // in that case rounding issues may yield the wrong result for left or right
        if (a.start.y >= b.start.y) {
            const aStartSide = getSideOfLine(b, a.start);
            if (aStartSide == Side.left) return -1;
            if (aStartSide == Side.right) return 1;

            const aEndSide = getSideOfLine(b, a.end);
            if (aEndSide == Side.left) return -1;
            if (aEndSide == Side.right) return 1;
        } else {
            const bStartSide = getSideOfLine(a, b.start);
            if (bStartSide == Side.left) return 1;
            if (bStartSide == Side.right) return -1;

            const bEndSide = getSideOfLine(a, b.end);
            if (bEndSide == Side.left) return 1;
            if (bEndSide == Side.right) return -1;
        }

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

    let event: IEvent<F> | undefined;
    while ((event = events.getMin())) {
        events.delete(event);
        if (event.type == "cross")
            handleCrossEvent(event, scanLine, events, eventIdCounter);
        else {
            const point: IPoint | undefined = event.point;
            const eventsAtPoint: Exclude<IEvent<F>, ICrossEvent<F>>[] = [event];
            let nextEvent: IEvent<F> | undefined;
            while ((nextEvent = events.getMin())) {
                if (nextEvent.type == "cross") break;
                if (!pointEquals(nextEvent.point, point)) break;
                events.delete(nextEvent);
                eventsAtPoint.push(nextEvent);
            }

            handleEvents(eventsAtPoint, scanLine, startSections, events, eventIdCounter);
        }
    }

    console.log([...startSections].filter(s => !s.bottomLeft && !s.bottomRight));
    return generateFaces(startSections);
}

/**
 * Returns a function that can be used to query the scanline for a given segment
 * @param segment The segment to be found
 * @param steer Whether to steer the query to the left, to the right right, or onto the interval
 * @returns The function to query the scanline with
 */
const findInterval: <F extends IFace<any>>(
    segment: ISegment,
    steer?: Side
) => (i: IInterval<F>) => -1 | 0 | 1 =
    ({start, end}, steer = Side.on) =>
    i => {
        let onLeft = false; // Whether the start point lies on the left of the interval
        let onRight = false; // Whether the start point lies on the right of the interval
        if (!i.left && i.right) {
            const side = getSideOfLine(i.right, start);
            if (side == Side.left) return steer;
            if (side == Side.right) return 1;
            onRight = true;
        } else if (i.left && !i.right) {
            const side = getSideOfLine(i.left, start);
            if (side == Side.left) return -1;
            if (side == Side.right) return steer;
            onLeft = true;
        } else if (!i.left || !i.right) {
            return steer; // This case shouldn't be reachable
        } else {
            const leftSide = getSideOfLine(i.left, start);
            if (leftSide == Side.left) return -1;
            if (leftSide == Side.on) onLeft = true;

            const rightSide = getSideOfLine(i.right, start);
            if (rightSide == Side.right) return 1;
            if (rightSide == Side.on) onRight = true;

            if (leftSide == Side.right && rightSide == Side.left) return steer;
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

        return steer;
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

    const x = (interceptA - interceptB) / (slopeB - slopeA);
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
    // bottomBoundaries: IBoundary<F>[],
    scanLine: BalancedSearchTree<IInterval<F>>
): IBoundary<F>[] {
    const cutOff: IBoundary<F>[] = [];

    const intervals = scanLine.findRange(
        findInterval({start: point, end: point}, Side.left),
        findInterval({start: point, end: point}, Side.right)
    );

    let prevInterval: IInterval<F> = intervals[0];
    const endIntervals = intervals.slice(1);
    for (let interval of endIntervals) {
        const left = interval.left;

        if (left) {
            const intersects = !pointEquals(left.end, point);

            if (intersects) {
                const newBoundary: IBoundary<F> = {
                    ...left,
                    start: point,
                };
                cutOff.push(newBoundary);

                prevInterval.right = interval.left = {
                    ...left,
                    end: point,
                };
                // debugger;
            }
        }

        prevInterval = interval;
    }
    return cutOff;
}

/**
 * Removes all the given boundaries from the intervals on the scan line
 * @param point The point in which the boundaries to be removed end
 * @param scanLine The scanline that the boundaries are on
 * @param eventQueue The event queue to add cross events to
 * @returns The left and right most removed intervals
 */
function removeBoundariesAtPoint<F extends IFace<any>>(
    point: IPoint,
    scanLine: BalancedSearchTree<IInterval<F>>,
    eventQueue: BalancedSearchTree<IEvent<F>>
): {leftInterval: IInterval<F>; rightInterval: IInterval<F>} {
    const intervals = scanLine.findRange(
        findInterval(
            {
                start: point,
                end: point,
            },
            Side.left
        ),
        findInterval(
            {
                start: point,
                end: point,
            },
            Side.right
        )
    );
    if (intervals.length < 1)
        throw new Error(`Reached unreachable state 2: ${JSON.stringify(point)}`);

    const innerIntervals = intervals.slice(1, -1);
    for (let interval of innerIntervals) {
        interval.shape.left.push(point);
        interval.shape.right.push(point);
        removeInterval(interval, scanLine, eventQueue);
    }

    const leftInterval = intervals[0];
    const rightInterval = intervals[intervals.length - 1];

    return {leftInterval, rightInterval};
}

/**
 * Adds the inner intervals for the given boundaries
 * @param boundaries The boundaries that form a new polygon section
 * @param startSources The sources of the interval to the left of left most boundary
 * @returns The left and right most boundaries, and the new intervals
 */
function addBoundariesInnerIntervals<F extends IFace<any>>(
    boundaries: IBoundary<F>[],
    startSources: IFaceSource<F>[]
): {
    leftBoundary: IBoundary<F>;
    rightBoundary: IBoundary<F>;
    newIntervals: IInterval<F>[];
} {
    const point = boundaries[0].start; // The start points are all the same
    const sortedBoundaries = sortBoundaries(boundaries);
    const endBoundaries = sortedBoundaries.slice(1);

    let prevBoundary = sortedBoundaries[0];
    let sources = startSources;
    const newIntervals: IInterval<F>[] = [];
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
        newIntervals.push(newInterval);

        prevBoundary = boundary;
    }

    return {
        leftBoundary: sortedBoundaries[0],
        rightBoundary: sortedBoundaries[sortedBoundaries.length - 1],
        newIntervals,
    };
}

/**
 * Handles the polygon events at a specific point
 * @param events All the polygon events with the same x and y coordinate
 * @param scanLine The scanline that the intervals are on
 * @param output The output set of polygon sections
 * @param eventQueue The event queue to add cross events to
 * @param eventIdCounter The counter to retrieve the next event id
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
    eventQueue: BalancedSearchTree<IEvent<F>>,
    eventIdCounter: ICounter
): void {
    // Unify the data of different event types
    const point = events[0].point; // All points are the same
    // const oldEventBoundaries = events.flatMap<IBoundary<F>>(event => {
    //     const {point, source} = event;
    //     if (event.type == "stop")
    //         return [
    //             {start: event.left, end: point, side: "left", source},
    //             {start: event.right, end: point, side: "right", source},
    //         ];
    //     if (event.type == "merge")
    //         return [
    //             {start: event.left, end: point, side: "right", source},
    //             {start: event.right, end: point, side: "left", source},
    //         ];
    //     if (event.type == "leftContinue")
    //         return [{start: event.prev, end: point, side: "left", source}];
    //     if (event.type == "rightContinue")
    //         return [{start: event.prev, end: point, side: "right", source}];
    //     return [];
    // });
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
        // oldEventBoundaries,
        scanLine
    );

    // Remove
    const {leftInterval, rightInterval} = removeBoundariesAtPoint(
        point,
        scanLine,
        eventQueue
    );
    const allNewBoundaries = [...newEventBoundaries, ...extraNewBoundaries];

    if (allNewBoundaries.length > 0) {
        const {leftBoundary, rightBoundary, newIntervals} = addBoundariesInnerIntervals(
            allNewBoundaries,
            leftInterval.sources
        );

        let newLeftInterval: IInterval<F>;
        let newRightInterval: IInterval<F>;
        if (leftInterval == rightInterval) {
            removeInterval(leftInterval, scanLine, eventQueue);

            const {shape: lis} = leftInterval;
            const {left: lsl, right: lsr} = lis;
            newLeftInterval = {
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
            newRightInterval = {
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
            if (newLeftInterval.sources.length > 0) output.add(newLeftInterval.shape);
            if (newRightInterval.sources.length > 0) output.add(newRightInterval.shape);
        } else {
            newLeftInterval = leftInterval;
            newRightInterval = rightInterval;

            newLeftInterval.right = leftBoundary;
            newRightInterval.left = rightBoundary;

            if (leftInterval.right) leftInterval.shape.right.push(point);
            if (rightInterval.left) rightInterval.shape.left.push(point);
        }

        for (let interval of newIntervals) {
            if (interval.sources.length > 0) output.add(interval.shape);
            scanLine.insert(interval);
        }

        // Check for line intersections, and note that it's impossible to intersect any of the internal boundaries such that they don't have to be checked
        checkIntersections(newLeftInterval, eventQueue, eventIdCounter);
        checkIntersections(newRightInterval, eventQueue, eventIdCounter);
        debugger;
    } else {
        removeInterval(leftInterval, scanLine, eventQueue);
        removeInterval(rightInterval, scanLine, eventQueue);

        const {shape: lis, left, sources} = leftInterval;
        const {shape: ris, right} = rightInterval;
        const {right: rsr} = ris;
        const {left: lsl} = lis;
        const newInterval: IInterval<F> = {
            left,
            right,
            sources,
            shape: {
                sources: leftInterval.sources,
                left: lsl.length == 0 ? [] : [lsl[lsl.length - 1]],
                right: rsr.length == 0 ? [] : [rsr[rsr.length - 1]],
                bottomLeft: lis,
                bottomRight: ris,
            },
        };
        lis.right.push(point);
        ris.left.push(point);
        lis.topLeft = newInterval.shape;
        ris.topRight = newInterval.shape;
        scanLine.insert(newInterval);
        if (newInterval.sources.length > 0) output.add(newInterval.shape);

        // Check for line intersections, and note that it's impossible to intersect any of the internal boundaries such that they don't have to be checked
        checkIntersections(newInterval, eventQueue, eventIdCounter);
        debugger;
    }
}

/**
 * Checks whether the given interval will intersect itself at some point, and adds the cross event if so
 * @param interval The interval to be checked
 * @param eventQueue The event queue to add the event to if applicable
 * @param eventIdCounter The counter to retrieve the next event id
 */
function checkIntersections<F extends IFace<any>>(
    interval: IInterval<F>,
    eventQueue: BalancedSearchTree<IEvent<F>>,
    eventIdCounter: ICounter
): void {
    if (!interval.left || !interval.right) return;
    if (doesIntersect(interval.left, interval.right)) {
        const intersect = getIntersectionPoint(interval.left, interval.right);
        const crossEvent: ICrossEvent<F> = {
            type: "cross",
            interval: interval,
            point: intersect,
            id: eventIdCounter(),
        };
        interval.intersection = intersect;
        eventQueue.insert(crossEvent);
    }
}

/**
 * Removes the given interval from the scanline and removes its intersection even from the queue if present
 * @param interval The interval to be removed
 * @param scanLine The scanline to remove it from
 * @param eventQueue The event queue to remove the intersection from
 */
function removeInterval<F extends IFace<any>>(
    interval: IInterval<F>,
    scanLine: BalancedSearchTree<IInterval<F>>,
    eventQueue: BalancedSearchTree<IEvent<F>>
): void {
    scanLine.delete(interval);
    if (interval.intersection) {
        const point = interval.intersection;
        const query = (side: Side) => (event: IEvent<F>) => {
            if (point.y != event.point.y) return point.y - event.point.y;
            if (point.x != event.point.x) return point.x - event.point.x;

            if (event.type != "cross") return -1;
            return side;
        };
        const crossEvents = eventQueue.findRange(query(Side.left), query(Side.right));
        const intervalEvent = crossEvents.find(
            event => event.type == "cross" && event.interval == interval
        );
        if (intervalEvent) eventQueue.delete(intervalEvent);
    }
}

/**
 * Handles the cross event by splitting the affected segments and adding continuation events to the queue
 * @param event The intersection event
 * @param scanLine The scanline that the affected intervals are on
 * @param eventQueue The queue of events to add the continuation events to
 * @param eventIdCounter The counter to retrieve the next event id
 */
function handleCrossEvent<F extends IFace<any>>(
    event: ICrossEvent<F>,
    scanLine: BalancedSearchTree<IInterval<F>>,
    eventQueue: BalancedSearchTree<IEvent<F>>,
    eventIdCounter: ICounter
): void {
    const {interval, point} = event;
    const {left: leftSegment, right: rightSegment} = interval;
    if (!leftSegment || !rightSegment)
        throw new Error(`Reached unreachable state 3: ${JSON.stringify(event)}`);

    const nl = leftSegment.end,
        pl = leftSegment.start,
        sl = leftSegment.source,
        idl = eventIdCounter();
    interval.left = {...leftSegment, end: point};
    const newLeftEvent: ILeftContinueEvent<F> | IRightContinueEvent<F> =
        leftSegment.side == "left"
            ? {type: "leftContinue", prev: pl, next: nl, point, source: sl, id: idl}
            : {type: "rightContinue", prev: pl, next: nl, point, source: sl, id: idl};
    eventQueue.insert(newLeftEvent);

    const nr = rightSegment.end,
        pr = rightSegment.start,
        sr = rightSegment.source,
        idr = eventIdCounter();
    interval.right = {...rightSegment, end: point};
    const newRightEvent: ILeftContinueEvent<F> | IRightContinueEvent<F> =
        rightSegment.side == "left"
            ? {type: "leftContinue", prev: pr, next: nr, point, source: sr, id: idr}
            : {type: "rightContinue", prev: pr, next: nr, point, source: sr, id: idr};
    eventQueue.insert(newRightEvent);

    // Update the neighbor intervals
    const prevInterval = scanLine.findPrevious(interval);
    const nextInterval = scanLine.findNext(interval);

    if (prevInterval) prevInterval.right = interval.left;
    if (nextInterval) nextInterval.left = interval.right;

    // const leftIntervals = scanLine.findRange(
    //     findInterval(leftSegment, Side.left),
    //     findInterval(leftSegment, Side.right)
    // );
    // if (leftIntervals.length < 2)
    //     throw new Error(`Reached unreachable state 4: ${JSON.stringify(leftSegment)}`);

    // const rightIntervals = scanLine.findRange(
    //     findInterval(rightSegment, Side.left),
    //     findInterval(rightSegment, Side.right)
    // );
    // if (rightIntervals.length < 2)
    //     throw new Error(`Reached unreachable state 5: ${JSON.stringify(rightSegment)}`);

    // // Split the left segment
    // const target
    // debugger;
    // // Split all left intervals
    // let endIntervals = leftIntervals.slice(1);
    // for (let leftInterval of endIntervals) {
    //     const {left} = leftInterval;
    //     if (left && !pointEquals(left.end, point)) {
    //         const next = left.end,
    //             prev = left.start,
    //             source = left.source;
    //         left.end = point;
    //         const newEvent: ILeftContinueEvent<F> | IRightContinueEvent<F> =
    //             left.side == "left"
    //                 ? {type: "leftContinue", prev, next, point, source}
    //                 : {type: "rightContinue", prev, next, point, source};
    //         eventQueue.insert(newEvent);
    //         debugger;
    //     }
    // }

    // // Split all right intervals
    // endIntervals = rightIntervals.slice(0, -1);
    // for (let rightInterval of endIntervals) {
    //     const {right} = rightInterval;
    //     if (right && !pointEquals(right.end, point)) {
    //         const next = right.end,
    //             prev = right.start,
    //             source = right.source;
    //         right.end = point;
    //         const newEvent: ILeftContinueEvent<F> | IRightContinueEvent<F> =
    //             right.side == "left"
    //                 ? {type: "leftContinue", prev, next, point, source}
    //                 : {type: "rightContinue", prev, next, point, source};
    //         eventQueue.insert(newEvent);
    //         debugger;
    //     }
    // }
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
 * @returns Whether this was a newly found section (as opposed to one already handled in case of a loop)
 */
function exploreSection<F extends IFace<any>>(
    section: IMonotonePolygonSection<F>,
    parent: IMonotonePolygonSection<F> | undefined,
    remainingSections: Set<IMonotonePolygonSection<F>>,
    output: IPoint[]
) {
    // If the section was already visited we encountered a loop
    if (!remainingSections.has(section)) return;
    remainingSections.delete(section);

    const {topLeft, bottomLeft, bottomRight, topRight} = section;

    let start = 0;
    if (parent) {
        if (topLeft == parent) start = 0;
        else if (bottomLeft == parent) start = 1;
        else if (bottomRight == parent) start = 2;
        else if (topRight == parent) start = 3;
    }

    for (let i = 0; i < 4; i++) {
        const side = (i + start) % 4;
        if (side == 0) {
            if (topLeft && topLeft != parent)
                exploreSection(topLeft, section, remainingSections, output);
        } else if (side == 1) {
            if (bottomLeft && bottomLeft != parent)
                exploreSection(bottomLeft, section, remainingSections, output);
        } else if (side == 2) {
            if (bottomRight && bottomRight != parent)
                exploreSection(bottomRight, section, remainingSections, output);
        } else if (side == 3) {
            if (topRight && topRight != parent)
                exploreSection(topRight, section, remainingSections, output);
        }

        if (side == 0) {
            const points = section.left.reverse();
            const lastOutput = output[output.length - 1];
            const newPoints =
                lastOutput && pointEquals(lastOutput, points[0])
                    ? points.slice(1)
                    : points;
            output.push(...newPoints);
        } else if (side == 2) {
            const lastOutput = output[output.length - 1];
            const newPoints =
                lastOutput && pointEquals(lastOutput, section.right[0])
                    ? section.right.slice(1)
                    : section.right;
            output.push(...newPoints);
        }
    }
}
