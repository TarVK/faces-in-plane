"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.augmentSources = exports.sortBoundaries = exports.getIntervalFinder = exports.addInterval = exports.removeInterval = exports.checkIntersections = void 0;
const doesIntersect_1 = require("./util/doesIntersect");
const getIntersectionPoint_1 = require("./util/getIntersectionPoint");
const getSideOfLine_1 = require("./util/getSideOfLine");
const Side_1 = require("./util/Side");
/**************************************************************************
 * This file contains helper functions that's specific to this algorithm, *
 * but not very interesting                                               *
 **************************************************************************/
/**
 * Checks whether the given interval will intersect itself at some point, and adds the cross event if so
 * @param interval The interval to be checked
 * @param eventQueue The event queue to add the event to if applicable
 * @param eventIdCounter The counter to retrieve the next event id
 */
function checkIntersections(interval, eventQueue, eventIdCounter) {
    if (!interval.left || !interval.right)
        return;
    if ((0, doesIntersect_1.doesIntersect)(interval.left, interval.right)) {
        const intersect = (0, getIntersectionPoint_1.getIntersectionPoint)(interval.left, interval.right);
        const crossEvent = {
            type: "cross",
            interval: interval,
            point: intersect,
            id: eventIdCounter(),
        };
        interval.intersection = crossEvent;
        eventQueue.insert(crossEvent);
    }
}
exports.checkIntersections = checkIntersections;
/**
 * Removes the given interval from the scanline and removes its intersection even from the queue if present
 * @param interval The interval to be removed
 * @param scanLine The scanline to remove it from
 * @param eventQueue The event queue to remove the intersection from
 */
function removeInterval(interval, scanLine, eventQueue) {
    scanLine.delete(interval);
    if (interval.intersection)
        eventQueue.delete(interval.intersection);
}
exports.removeInterval = removeInterval;
/**
 * Adds the given interval to the scanline and possibly adds its corresponding intersection event
 * @param interval The interval to be added
 * @param scanLine The scanline to add it to
 * @param output The output to add the new interval's shape to
 * @param eventIdCounter The counter to retrieve the next event id
 * @param eventQueue The event queue to add the intersection to, or undefined it the intersection doesn't have to be checked
 */
function addInterval(interval, scanLine, output, eventIdCounter, eventQueue) {
    scanLine.insert(interval);
    output.add(interval.shape);
    if (eventQueue && eventIdCounter)
        checkIntersections(interval, eventQueue, eventIdCounter);
}
exports.addInterval = addInterval;
/**
 * Returns a function that can be used to query the scanline for a given point
 * @param point The point to find
 * @param steer Whether to steer the query to the left, to the right right, or onto the interval
 * @returns The function to query the scanline with
 */
const getIntervalFinder = (point, steer = Side_1.Side.on) => i => {
    if (i.left) {
        const leftSide = (0, getSideOfLine_1.getSideOfLine)(i.left, point);
        if (leftSide == Side_1.Side.left)
            return -1;
    }
    if (i.right) {
        const rightSide = (0, getSideOfLine_1.getSideOfLine)(i.right, point);
        if (rightSide == Side_1.Side.right)
            return 1;
    }
    return steer;
};
exports.getIntervalFinder = getIntervalFinder;
/**
 * Sorts the given boundaries from left to right
 * @param boundaries The boundaries to be sorted
 * @returns The sorted boundaries
 */
function sortBoundaries(boundaries) {
    const sorted = [...boundaries];
    sorted.sort((a, b) => {
        const startSide = (0, getSideOfLine_1.getSideOfLine)(b, a.start);
        if (startSide != Side_1.Side.on)
            return startSide;
        const endSide = (0, getSideOfLine_1.getSideOfLine)(b, a.end);
        if (endSide != Side_1.Side.on)
            return endSide;
        return a.id - b.id;
    });
    return sorted;
}
exports.sortBoundaries = sortBoundaries;
/**
 * Augments the given sources as would happen when crossing its boundary from left to right with the given data
 * @param sources The sources to be augment
 * @param boundary THe boundary to be crossed
 * @returns The augmented sources
 */
function augmentSources(sources, boundary) {
    if (boundary.side == "left")
        return [...sources, boundary.source];
    else
        return sources.filter(el => el != boundary.source);
}
exports.augmentSources = augmentSources;
//# sourceMappingURL=utils.js.map