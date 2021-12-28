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
import {ICrossEvent, IEvent, ILeftContinueEvent, IStartEvent} from "./_types/IEvents";
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
        if (event.type == "start") handleStart(event, scanLine, startSections, events);
        else if (event.type == "leftContinue") handleLeftContinue();
    }
}

/**
 * Returns a function that can be used to query the scanline for a given segment
 * @param start The point to be queried on the scanline
 * @param end The end point to be queried
 * @returns The function to query the scanline with
 */
const findInterval: <D>(start: IPoint, end: IPoint) => (i: IInterval<D>) => -1 | 0 | 1 =
    (start, end) => i => {
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
 * Handles the start event of a polygon
 * @param event The start event
 * @param scanLine The scanline
 * @param output The output to accumulate start pieces of output polygons into
 * @param events The event queue to add new possible future events into
 */
function handleStart<D>(
    event: IStartEvent<D>,
    scanLine: BalancedSearchTree<IInterval<D>>,
    output: Set<IMonotonePolygonSection<D>>,
    events: BalancedSearchTree<IEvent<D>>
): void {
    const intervals = scanLine.findRange(
        findInterval(event.point, event.left),
        findInterval(event.point, event.right)
    );
    if (intervals.length == 0)
        throw new Error(`Reached unreachable state 1: ${event.point}`);

    for (let interval of intervals) scanLine.delete(interval);

    // In most cases leftInterval==rightIntervals, but they may be different if lines start in the same point
    const leftInterval = intervals[0];
    const rightInterval = intervals[intervals.length - 1];

    // Create the new intervals outside the started polygon
    const newLeftBoundary: IBoundary<D> = {
        start: event.point,
        end: event.left,
        data: event.data,
        side: "left",
    };
    const {shape: lis} = leftInterval;
    const {left: lsl, right: lsr} = lis;
    const newLeftInterval: IInterval<D> = {
        ...leftInterval,
        right: newLeftBoundary,
        shape: {
            data: leftInterval.data,
            left: lsl.length == 0 ? [] : [lsl[lsl.length - 1]],
            right: [event.point],
            bottomLeft: lis,
        },
    };

    const newRightBoundary: IBoundary<D> = {
        start: event.point,
        end: event.right,
        data: event.data,
        side: "right",
    };
    const {shape: ris} = rightInterval;
    const {left: rsl, right: rsr} = ris;
    const newRightInterval: IInterval<D> = {
        ...rightInterval,
        left: newRightBoundary,
        shape: {
            data: rightInterval.data,
            left: [event.point],
            right: rsr.length == 0 ? [] : [rsr[rsr.length - 1]],
            bottomRight: ris,
        },
    };

    lis.topLeft = newLeftInterval.shape;
    ris.topRight = newRightInterval.shape;
    scanLine.insert(newLeftInterval);
    scanLine.insert(newRightInterval);

    // Create the new intervals inside the started polygon
    if (leftInterval == rightInterval) {
        const newData = [...leftInterval.data, event.data];
        const newMiddleInterval: IInterval<D> = {
            data: newData,
            left: newLeftBoundary,
            right: newRightBoundary,
            shape: {
                data: newData,
                left: [event.point],
                right: [event.point],
            },
        };
        scanLine.insert(newMiddleInterval);
        output.add(newMiddleInterval.shape);
    } else {
        const newMiddleLeftData = [...leftInterval.data, event.data];
        const {shape: lis} = leftInterval;
        const {left: lsl, right: lsr} = lis;
        const newMiddleLeftInterval: IInterval<D> = {
            data: newMiddleLeftData,
            left: newLeftBoundary,
            right: leftInterval.right,
            shape: {
                data: newMiddleLeftData,
                left: [event.point],
                right: lsr.length == 0 ? [] : [lsr[lsr.length - 1]],
            },
        };
        output.add(newMiddleLeftInterval.shape);
        scanLine.insert(newMiddleLeftInterval);

        const newMiddleRightData = [...rightInterval.data, event.data];
        const {shape: ris} = leftInterval;
        const {left: rsl, right: rsr} = ris;
        const newMiddleRightInterval: IInterval<D> = {
            data: newMiddleRightData,
            left: leftInterval.left,
            right: newRightBoundary,
            shape: {
                data: newMiddleRightData,
                left: rsl.length == 0 ? [] : [rsl[rsl.length - 1]],
                right: [event.point],
            },
        };
        output.add(newMiddleRightInterval.shape);
        scanLine.insert(newMiddleRightInterval);

        // Update the data of all intermediate intervals
        const middleIntervals = intervals.slice(1, -1);
        for (let interval of middleIntervals) {
            const newData = [...interval.data, event.data];
            const newInterval: IInterval<D> = {
                ...interval,
                data: newData,
                shape: {
                    ...interval.shape,
                    data: newData,
                },
            };

            output.delete(interval.shape);
            output.add(newInterval.shape);
            scanLine.insert(newInterval);
        }
    }

    // Check for line intersections, and note that it's impossible to intersect any of the internal boundaries such that they don't have to be checked
    if (leftInterval.left && doesIntersect(leftInterval.left, newLeftBoundary, true)) {
        const intersect = getIntersectionPoint(leftInterval.left, newLeftBoundary);
        const crossEvent: ICrossEvent = {
            type: "cross",
            left: leftInterval.left.start,
            right: newLeftBoundary.start,
            point: intersect,
        };
        events.insert(crossEvent);
    }
    if (
        rightInterval.right &&
        doesIntersect(newRightBoundary, rightInterval.right, true)
    ) {
        const intersect = getIntersectionPoint(newRightBoundary, rightInterval.right);
        const crossEvent: ICrossEvent = {
            type: "cross",
            left: newRightBoundary.start,
            right: rightInterval.right.start,
            point: intersect,
        };
        events.insert(crossEvent);
    }
}

/**
 * Handles the left edge continue event
 * @param event The left continue event
 * @param scanLine The scanline
 */
function handleLeftContinue<D>(
    event: ILeftContinueEvent<D>,
    scanLine: BalancedSearchTree<IInterval<D>>,
    events: BalancedSearchTree<IEvent<D>>
): void {
    const sourceQuery = findInterval(event.prev, event.point);
    const intervals = scanLine.findRange(sourceQuery, sourceQuery);

    if (intervals.length < 2)
        throw new Error(`Reached unreachable state 2: ${(event.prev, event.point)}`);

    const leftInterval = intervals[0];
    const rightInterval = intervals[intervals.length - 1];
}
