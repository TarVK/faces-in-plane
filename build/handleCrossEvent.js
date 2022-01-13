"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCrossEvent = void 0;
/**
 * Handles the cross event by splitting the affected segments and adding continuation events to the queue
 * @param event The intersection event
 * @param scanLine The scanline that the affected intervals are on
 * @param eventQueue The queue of events to add the continuation events to
 * @param eventIdCounter The counter to retrieve the next event id
 */
function handleCrossEvent(event, scanLine, eventQueue, eventIdCounter) {
    const { interval, point } = event;
    const { left: leftSegment, right: rightSegment } = interval;
    if (!leftSegment || !rightSegment)
        throw new Error(`Reached unreachable state 3: ${JSON.stringify(event)}`);
    interval.left = { ...leftSegment, end: point };
    const newLeftEvent = {
        ...leftSegment,
        type: "line",
        point,
        id: eventIdCounter(),
    };
    eventQueue.insert(newLeftEvent);
    interval.right = { ...rightSegment, end: point };
    const newRightEvent = {
        ...rightSegment,
        type: "line",
        point,
        id: eventIdCounter(),
    };
    eventQueue.insert(newRightEvent);
    // Update the neighbor intervals
    const prevInterval = scanLine.findPrevious(interval);
    const nextInterval = scanLine.findNext(interval);
    if (prevInterval)
        prevInterval.right = interval.left;
    if (nextInterval)
        nextInterval.left = interval.right;
}
exports.handleCrossEvent = handleCrossEvent;
//# sourceMappingURL=handleCrossEvent.js.map