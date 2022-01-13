"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePolygonEvents = void 0;
const pointEquals_1 = require("./util/pointEquals");
const Side_1 = require("./util/Side");
const utils_1 = require("./utils");
/**
 * Handles the polygon events at a specific point
 * @param events All the polygon events with the same x and y coordinate
 * @param scanLine The scanline that the intervals are on
 * @param output The output set of polygon sections
 * @param eventQueue The event queue to add cross events to
 * @param eventIdCounter The counter to retrieve the next event id
 */
function handlePolygonEvents(events, scanLine, output, eventQueue, eventIdCounter) {
    const point = events[0].point; // All points are the same
    const intervalsWithPoint = scanLine.findRange((0, utils_1.getIntervalFinder)(point, Side_1.Side.left), (0, utils_1.getIntervalFinder)(point, Side_1.Side.right));
    if (intervalsWithPoint.length == 0)
        throw new Error(`Unreachable state, every point is included in at least 1 interval: ${JSON.stringify(point)}`);
    // Collect all boundaries that start in the given point
    const extraNewBoundaries = getContinuationsThroughPoint(point, intervalsWithPoint);
    const newEventBoundaries = events
        .filter((event) => event.type == "line")
        .map(({ point, end, side, id, source }) => ({
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
        (0, utils_1.removeInterval)(interval, scanLine, eventQueue);
    }
    const leftInterval = intervalsWithPoint[0];
    const rightInterval = intervalsWithPoint[intervalsWithPoint.length - 1];
    // Create the new intervals and or update old intervals
    if (allNewBoundaries.length > 0) {
        const { leftBoundary, rightBoundary, newIntervals } = getNewIntervals(allNewBoundaries, leftInterval.shape.sources);
        if (leftInterval == rightInterval) {
            (0, utils_1.removeInterval)(leftInterval, scanLine, eventQueue);
            const { shape: lis } = leftInterval;
            const { left: lsl } = lis;
            const newLeftInterval = {
                ...leftInterval,
                right: leftBoundary,
                shape: {
                    sources: leftInterval.shape.sources,
                    left: lsl.length == 0 ? [] : [lsl[lsl.length - 1]],
                    right: [point],
                    bottomLeft: lis,
                },
            };
            const { shape: ris } = rightInterval;
            const { right: rsr } = ris;
            const newRightInterval = {
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
            (0, utils_1.addInterval)(newLeftInterval, scanLine, output, eventIdCounter, eventQueue);
            (0, utils_1.addInterval)(newRightInterval, scanLine, output, eventIdCounter, eventQueue);
        }
        else {
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
            (0, utils_1.checkIntersections)(leftInterval, eventQueue, eventIdCounter);
            (0, utils_1.checkIntersections)(rightInterval, eventQueue, eventIdCounter);
        }
        for (let interval of newIntervals)
            (0, utils_1.addInterval)(interval, scanLine, output); // Note that we don't have to check intersections, since these are start intervals
    }
    else {
        (0, utils_1.removeInterval)(leftInterval, scanLine, eventQueue);
        (0, utils_1.removeInterval)(rightInterval, scanLine, eventQueue);
        const { shape: lis, left } = leftInterval;
        const { shape: ris, right } = rightInterval;
        const { right: rsr } = ris;
        const { left: lsl, sources } = lis;
        const newInterval = {
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
        (0, utils_1.addInterval)(newInterval, scanLine, output, eventIdCounter, eventQueue);
    }
}
exports.handlePolygonEvents = handlePolygonEvents;
/**
 * Splits all the boundaries of intervals that the given point goes through
 * @param point The point to be checked for
 * @param intervals The intervals that include the given point
 * @returns The tops of the cut-off boundaries
 */
function getContinuationsThroughPoint(point, intervals) {
    const cutOff = [];
    let prevInterval = intervals[0];
    const endIntervals = intervals.slice(1);
    for (let interval of endIntervals) {
        const left = interval.left;
        if (left) {
            const intersects = !(0, pointEquals_1.pointEquals)(left.end, point);
            if (intersects) {
                const newBoundary = {
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
function getNewIntervals(boundaries, startSources) {
    const point = boundaries[0].start; // The start points are all the same
    const sortedBoundaries = (0, utils_1.sortBoundaries)(boundaries);
    const endBoundaries = sortedBoundaries.slice(1);
    let prevBoundary = sortedBoundaries[0];
    let sources = startSources;
    const newIntervals = [];
    for (let boundary of endBoundaries) {
        sources = (0, utils_1.augmentSources)(sources, prevBoundary);
        const newShape = {
            sources,
            left: [point],
            right: [point],
        };
        const newInterval = {
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
//# sourceMappingURL=handlePolygonEvents.js.map