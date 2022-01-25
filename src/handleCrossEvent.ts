import {IFace} from "./util/_types/IFace";
import {BalancedSearchTree} from "./util/BalancedSearchTree";
import {ICounter} from "./_types/ICounter";
import {ICrossEvent, IEvent, ILineEvent} from "./_types/IEvent";
import {IInterval} from "./_types/IInterval";
import {getSideOfLine, pointEquals, Side} from ".";

/**
 * Handles the cross event by splitting the affected segments and adding continuation events to the queue
 * @param event The intersection event
 * @param scanLine The scanline that the affected intervals are on
 * @param eventQueue The queue of events to add the continuation events to
 * @param eventIdCounter The counter to retrieve the next event id
 */
export function handleCrossEvent<F extends IFace<any>>(
    event: ICrossEvent<F>,
    scanLine: BalancedSearchTree<IInterval<F>>,
    eventQueue: BalancedSearchTree<IEvent<F>>,
    eventIdCounter: ICounter
): void {
    const {interval, point} = event;
    const {left: leftSegment, right: rightSegment} = interval;
    if (!leftSegment || !rightSegment)
        throw new Error(`Reached unreachable state 3: ${JSON.stringify(event)}`);

    const prevInterval = scanLine.findPrevious(interval);
    const nextInterval = scanLine.findNext(interval);
    debugger;

    // Cut the segments
    interval.left = {...leftSegment, end: point};
    const newLeftEvent: ILineEvent<F> = {
        ...leftSegment,
        type: "line",
        point,
        id: eventIdCounter(),
    };
    if (!pointEquals(newLeftEvent.point, newLeftEvent.end))
        eventQueue.insert(newLeftEvent);

    interval.right = {...rightSegment, end: point};
    const newRightEvent: ILineEvent<F> = {
        ...rightSegment,
        type: "line",
        point,
        id: eventIdCounter(),
    };
    if (!pointEquals(newRightEvent.point, newRightEvent.end))
        eventQueue.insert(newRightEvent);

    // Update the neighbor intervals
    if (prevInterval) prevInterval.right = interval.left;
    if (nextInterval) nextInterval.left = interval.right;

    debugger;
    if (
        prevInterval?.left &&
        prevInterval?.right &&
        (getSideOfLine(prevInterval.right, prevInterval.left.start) == Side.right ||
            (getSideOfLine(prevInterval.right, prevInterval.left.start) == Side.on &&
                getSideOfLine(prevInterval.right, prevInterval.left.end) == Side.right))
    ) {
        console.log("Detect1", {left: prevInterval.left, right: prevInterval.right});
    }
    if (
        nextInterval?.left &&
        nextInterval?.right &&
        (getSideOfLine(nextInterval.right, nextInterval.left.start) == Side.right ||
            (getSideOfLine(nextInterval.right, nextInterval.left.start) == Side.on &&
                getSideOfLine(nextInterval.right, nextInterval.left.end) == Side.right))
    ) {
        console.log("Detect2", {left: nextInterval.left, right: nextInterval.right});
    }
}
