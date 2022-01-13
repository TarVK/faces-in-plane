import {IFace} from "../data/_types/IFace";
import {IPoint} from "../data/_types/IPoint";
import {ISegment} from "../data/_types/ISegment";
import {BalancedSearchTree} from "../utils/BalancedSearchTree";
import {getSideOfLine} from "../utils/getSideOfLine";
import {pointEquals} from "../utils/pointEquals";
import {Side} from "../utils/Side";
import {getFaceEvents} from "./getFaceEvents";
import {IBoundary} from "./_types/IBoundary";
import {ICounter} from "./_types/ICounter";
import {ICrossEvent, IEvent, ILineEvent, IStopEvent} from "./_types/IEvent";
import {IInterval} from "./_types/IInterval";
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

        // Sort all events with the same points arbitrarily
        return ida - idb;
    });

    for (let face of faces) {
        const faceEvents = getFaceEvents(face, eventIdCounter);
        for (let faceEvent of faceEvents) events.insert(faceEvent);
    }

    // Perform the scanline sweep
    const scanLine = new BalancedSearchTree<IInterval<F>>(({left: a}, {left: b}) => {
        if (!a && !b) return 0; // There is only 1 interval with no  left boundary on any scanline
        if (!a) return -1;
        if (!b) return 1;

        const aStartSide = getSideOfLine(b, a.start);
        const aEndSide = getSideOfLine(b, a.end);

        // aEndSide != -aStartSide prioritizes b's result in case a's points are on opposite sides of b
        if (aStartSide != Side.on && aEndSide != -aStartSide) return aStartSide;
        if (aEndSide != Side.on && aEndSide != -aStartSide) return aEndSide;

        const bStartSide = getSideOfLine(a, b.start);
        if (bStartSide != Side.on) return -bStartSide;
        const bEndSide = getSideOfLine(a, b.end);
        if (bEndSide != Side.on) return -bEndSide;

        // Sort all intervals with the same left boundary arbitrarily
        return a.id - b.id;
    });
    const outerInterval: IInterval<F> = {
        shape: {
            left: [],
            right: [],
            sources: [],
        },
    };
    scanLine.insert(outerInterval);
    const sections = new Set<IMonotonePolygonSection<F>>();

    let event: IEvent<F> | undefined;
    while ((event = events.getMin())) {
        events.delete(event);
        if (event.type == "cross")
            handleCrossEvent(event, scanLine, events, eventIdCounter);
        else {
            const point: IPoint | undefined = event.point;
            const eventsAtPoint: (ILineEvent<F> | IStopEvent<F>)[] = [event];

            let nextEvent: IEvent<F> | undefined;
            while ((nextEvent = events.getMin())) {
                if (nextEvent.type == "cross") break;
                if (!pointEquals(nextEvent.point, point)) break;

                events.delete(nextEvent);
                eventsAtPoint.push(nextEvent);
            }

            handleEvents(eventsAtPoint, scanLine, sections, events, eventIdCounter);
        }
    }

    return generateFaces(sections);
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

    interval.left = {...leftSegment, end: point};
    const newLeftEvent: ILineEvent<F> = {
        ...leftSegment,
        type: "line",
        point,
        id: eventIdCounter(),
    };
    eventQueue.insert(newLeftEvent);

    interval.right = {...rightSegment, end: point};
    const newRightEvent: ILineEvent<F> = {
        ...rightSegment,
        type: "line",
        point,
        id: eventIdCounter(),
    };
    eventQueue.insert(newRightEvent);

    // Update the neighbor intervals
    const prevInterval = scanLine.findPrevious(interval);
    const nextInterval = scanLine.findNext(interval);

    if (prevInterval) prevInterval.right = interval.left;
    if (nextInterval) nextInterval.left = interval.right;
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
    events: (ILineEvent<F> | IStopEvent<F>)[],
    scanLine: BalancedSearchTree<IInterval<F>>,
    output: Set<IMonotonePolygonSection<F>>,
    eventQueue: BalancedSearchTree<IEvent<F>>,
    eventIdCounter: ICounter
): void {
    const point = events[0].point; // All points are the same
    const intervalsWithPoint = scanLine.findRange(
        getIntervalFinder(point, Side.left),
        getIntervalFinder(point, Side.right)
    );
    if (intervalsWithPoint.length == 0)
        throw new Error(
            `Unreachable state, every point is included in at least 1 interval: ${JSON.stringify(
                point
            )}`
        );

    // Collect all boundaries that start in the given point
    const extraNewBoundaries = getContinuationsThroughPoint(point, intervalsWithPoint);
    const newEventBoundaries = events
        .filter((event): event is ILineEvent<F> => event.type == "line")
        .map<IBoundary<F>>(({point, end, side, id, source}) => ({
            start: point,
            end,
            side,
            id,
            source,
        }));
    const allNewBoundaries = [...newEventBoundaries, ...extraNewBoundaries];

    // Finish old intervals that stop at the given point
    const innerIntervals = intervalsWithPoint.slice(1, -1);
    for (let interval of innerIntervals) {
        interval.shape.left.push(point);
        interval.shape.right.push(point);
        removeInterval(interval, scanLine, eventQueue);
    }

    const leftInterval = intervalsWithPoint[0];
    const rightInterval = intervalsWithPoint[intervalsWithPoint.length - 1];

    // Create the new intervals and or update old intervals

    if (allNewBoundaries.length > 0) {
        const {leftBoundary, rightBoundary, newIntervals} = getNewIntervals(
            allNewBoundaries,
            leftInterval.shape.sources
        );

        if (leftInterval == rightInterval) {
            removeInterval(leftInterval, scanLine, eventQueue);

            const {shape: lis} = leftInterval;
            const {left: lsl} = lis;
            const newLeftInterval: IInterval<F> = {
                ...leftInterval,
                right: leftBoundary,
                shape: {
                    sources: leftInterval.shape.sources,
                    left: lsl.length == 0 ? [] : [lsl[lsl.length - 1]],
                    right: [point],
                    bottomLeft: lis,
                },
            };

            const {shape: ris} = rightInterval;
            const {right: rsr} = ris;
            const newRightInterval: IInterval<F> = {
                ...rightInterval,
                left: rightBoundary,
                shape: {
                    sources: rightInterval.shape.sources,
                    left: [point],
                    right: rsr.length == 0 ? [] : [rsr[rsr.length - 1]],
                    bottomRight: ris,
                },
            };

            lis.topLeft = newLeftInterval.shape;
            ris.topRight = newRightInterval.shape;

            addInterval(newLeftInterval, scanLine, output, eventIdCounter, eventQueue);
            addInterval(newRightInterval, scanLine, output, eventIdCounter, eventQueue);
        } else {
            leftInterval.right = leftBoundary;
            rightInterval.left = rightBoundary;

            leftInterval.shape.right.push(point);
            rightInterval.shape.left.push(point);

            if (leftInterval.intersection) {
                eventQueue.delete(leftInterval.intersection);
                leftInterval.intersection = undefined;
            }
            if (rightInterval.intersection) {
                eventQueue.delete(rightInterval.intersection);
                rightInterval.intersection = undefined;
            }

            checkIntersections(leftInterval, eventQueue, eventIdCounter);
            checkIntersections(rightInterval, eventQueue, eventIdCounter);
        }

        for (let interval of newIntervals) addInterval(interval, scanLine, output); // Note that we don't have to check intersections, since these are start intervals
    } else {
        removeInterval(leftInterval, scanLine, eventQueue);
        removeInterval(rightInterval, scanLine, eventQueue);

        const {shape: lis, left} = leftInterval;
        const {shape: ris, right} = rightInterval;
        const {right: rsr} = ris;
        const {left: lsl, sources} = lis;
        const newInterval: IInterval<F> = {
            left,
            right,
            shape: {
                sources,
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

        addInterval(newInterval, scanLine, output, eventIdCounter, eventQueue);
    }
}

/**
 * Splits all the boundaries of intervals that the given point goes through
 * @param point The point to be checked for
 * @param intervals The intervals that include the given point
 * @returns The tops of the cut-off boundaries
 */
function getContinuationsThroughPoint<F extends IFace<any>>(
    point: IPoint,
    intervals: IInterval<F>[]
): IBoundary<F>[] {
    const cutOff: IBoundary<F>[] = [];

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
            }
        }

        prevInterval = interval;
    }
    return cutOff;
}

/**
 * Adds the inner intervals for the given boundaries
 * @param boundaries The boundaries that form a new polygon section
 * @param startSources The sources of the interval to the left of left most boundary
 * @returns The left and right most boundaries, and the new intervals
 */
function getNewIntervals<F extends IFace<any>>(
    boundaries: IBoundary<F>[],
    startSources: F[]
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
        interval.intersection = crossEvent;
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
    if (interval.intersection) eventQueue.delete(interval.intersection);
}

/**
 * Adds the given interval to the scanline and possibly adds its corresponding intersection event
 * @param interval The interval to be added
 * @param scanLine The scanline to add it to
 * @param output The output to add the new interval's shape to
 * @param eventIdCounter The counter to retrieve the next event id
 * @param eventQueue The event queue to add the intersection to, or undefined it the intersection doesn't have to be checked
 */
function addInterval<F extends IFace<any>>(
    interval: IInterval<F>,
    scanLine: BalancedSearchTree<IInterval<F>>,
    output: Set<IMonotonePolygonSection<F>>,
    eventIdCounter?: ICounter,
    eventQueue?: BalancedSearchTree<IEvent<F>>
): void {
    scanLine.insert(interval);
    output.add(interval.shape);

    if (eventQueue && eventIdCounter)
        checkIntersections(interval, eventQueue, eventIdCounter);
}

/**
 * Returns a function that can be used to query the scanline for a given point
 * @param point The point to find
 * @param steer Whether to steer the query to the left, to the right right, or onto the interval
 * @returns The function to query the scanline with
 */
const getIntervalFinder: <F extends IFace<any>>(
    point: IPoint,
    steer?: Side
) => (i: IInterval<F>) => -1 | 0 | 1 =
    (point, steer = Side.on) =>
    i => {
        if (i.left) {
            const leftSide = getSideOfLine(i.left, point);
            if (leftSide == Side.left) return -1;
        }

        if (i.right) {
            const rightSide = getSideOfLine(i.right, point);
            if (rightSide == Side.right) return 1;
        }

        return steer;
    };

/**
 * Generates the full list of polygons given a set of sections, removing empty polygons and the outerface polygon
 * @param sections The sections of the faces. Note: multiple sections of the same face my be present
 * @returns The generated faces
 */
function generateFaces<F extends IFace<any>>(
    sections: Set<IMonotonePolygonSection<F>>
): IFace<F[]>[] {
    const output: IFace<F[]>[] = [];
    for (let section of sections) {
        if (section.sources.length == 0) continue;

        const points: IPoint[] = [];
        exploreSection(section, undefined, sections, points);

        const noDuplicates: IPoint[] = [];
        let lastPoint: IPoint = points[points.length - 1];
        for (let point of points) {
            if (!pointEquals(lastPoint, point)) noDuplicates.push(point);
            lastPoint = point;
        }

        if (noDuplicates.length <= 2) continue;

        const face: IFace<F[]> = {
            data: section.sources,
            polygon: noDuplicates,
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

        if (side == 0) output.push(...section.left.reverse());
        else if (side == 2) output.push(...section.right);
    }
}

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

    if (dxA == 0 && dxB == 0) return {x: a.start.x, y: Math.max(a.start.y, b.start.y)};
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
        if (side == Side.on) return a.id - b.id;
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
function augmentSources<F extends IFace<any>>(sources: F[], boundary: IBoundary<F>): F[] {
    if (boundary.side == "left") return [...sources, boundary.source];
    else return sources.filter(el => el != boundary.source);
}
