import {IFace} from "./util/_types/IFace";
import {IPoint} from "./util/_types/IPoint";
import {BalancedSearchTree} from "./util/BalancedSearchTree";
import {doesIntersect} from "./util/doesIntersect";
import {getIntersectionPoint} from "./util/getIntersectionPoint";
import {getSideOfLine} from "./util/getSideOfLine";
import {Side} from "./util/Side";
import {IBoundary} from "./_types/IBoundary";
import {ICounter} from "./_types/ICounter";
import {ICrossEvent, IEvent} from "./_types/IEvent";
import {IInterval} from "./_types/IInterval";
import {IMonotonePolygonSection} from "./_types/IMonotonePolygonSection";
import {ISegment, pointEquals} from ".";
import {debugging} from "./debug";

/****************************************************************************
 * This file contains helper functions that are specific to this algorithm, *
 * but not very interesting                                                 *
 ****************************************************************************/

/**
 * Checks whether the given interval will intersect itself at some point, and adds the cross event if so
 * @param interval The interval to be checked
 * @param eventQueue The event queue to add the event to if applicable
 * @param eventIdCounter The counter to retrieve the next event id
 */
export function checkIntersections<F extends IFace<any>>(
    interval: IInterval<F>,
    eventQueue: BalancedSearchTree<IEvent<F>>,
    eventIdCounter: ICounter
): void {
    if (!interval.left || !interval.right) return;
    if (doesIntersect(interval.left, interval.right)) {
        const intersectRaw = getIntersectionPoint(interval.left, interval.right);
        if (debugging.enabled) (intersectRaw as any)["isIntersection"] = true;
        const intersect = firstPoint(interval.left.end, interval.right.end, intersectRaw);

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
export function removeInterval<F extends IFace<any>>(
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
export function addInterval<F extends IFace<any>>(
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
export const getIntervalFinder: <F extends IFace<any>>(
    point: IPoint,
    steer?: Side
) => (i: IInterval<F>) => -1 | 0 | 1 =
    (point, steer = Side.on) =>
    i => {
        if (i.left) {
            const leftSide = getSideOfLineOrPoint(i.left, point);
            if (leftSide == Side.left) return Side.left;
            if (leftSide == Side.on) return steer;
        }

        if (i.right) {
            const rightSide = getSideOfLineOrPoint(i.right, point);
            if (rightSide == Side.right) return Side.right;
            if (rightSide == Side.on) return steer;
        }

        return steer;
    };

/**
 * Sorts the given boundaries from left to right
 * @param boundaries The boundaries to be sorted
 * @returns The sorted boundaries
 */
export function sortBoundaries<F extends IFace<any>>(
    boundaries: IBoundary<F>[]
): IBoundary<F>[] {
    const sorted = [...boundaries];
    sorted.sort((a, b) => {
        const startSide = getSideOfLineOrPoint(b, a.start);
        if (startSide != Side.on) return startSide;
        const endSide = getSideOfLineOrPoint(b, a.end);
        if (endSide != Side.on) return endSide;
        return a.id - b.id;
    });
    return sorted;
}

/**
 * Augments the given sources as would happen when crossing its boundary from left to right with the given data
 * @param sources The sources to be augment
 * @param boundary THe boundary to be crossed
 * @returns The augmented sources
 */
export function augmentSources<F extends IFace<any>>(
    sources: F[],
    boundary: IBoundary<F>
): F[] {
    // TODO: start using some kind of immutable set datastructure and make addition/removal operations log(n) time
    if (boundary.side == "left") return [...sources, boundary.source];
    else return sources.filter(el => el != boundary.source);
}

// This function is used to deal with a robustness issue that can occur when a intersection event calculates the intersection to be an already earlier handled point
/**
 * Checks the side that the given point is relative to the line. In case the given line consists of two equal points, it checks a vertical line through this point
 * @param line The line to compare to
 * @param point The point to get the side of
 * @returns The side relative to the line
 */
export function getSideOfLineOrPoint(line: ISegment, point: IPoint) {
    if (pointEquals(line.end, line.start)) {
        if (point.x < line.start.x) return Side.left;
        if (point.x > line.start.x) return Side.right;
        return Side.on;
    }
    return getSideOfLine(line, point);
}

/**
 * Determines the point whose event would occur first in lexicographical ordering
 * @param points The points to get the first of
 * @returns The point that's first
 */
export function firstPoint(...points: IPoint[]): IPoint {
    return points.reduce((p1, p2) =>
        p1.y < p2.y || (p1.y == p2.y && p1.x < p2.x) ? p1 : p2
    );
}
