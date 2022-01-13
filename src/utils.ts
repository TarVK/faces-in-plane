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
export function checkIntersections<F extends IFace<any>>(
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
            const leftSide = getSideOfLine(i.left, point);
            if (leftSide == Side.left) return Side.left;
        }

        if (i.right) {
            const rightSide = getSideOfLine(i.right, point);
            if (rightSide == Side.right) return Side.right;
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
        const startSide = getSideOfLine(b, a.start);
        if (startSide != Side.on) return startSide;
        const endSide = getSideOfLine(b, a.end);
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
