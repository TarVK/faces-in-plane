import {BalancedSearchTree, IFace, Side} from ".";
import {sideOfSegment} from "./combineFaces";
import {getSideOfLineOrPoint} from "./utils";
import {IEvent} from "./_types/IEvent";
import {IInterval} from "./_types/IInterval";

/**
 * A variable specifying debugging properties
 */
export const debugging = {enabled: false};
/**
 * If debug mode is enabled, checks whether all invariants are satisfied and throws an error if they aren't
 * @param scanLine
 * @param eventQueue
 * @throws An error if the invariants aren't met
 */
export function checkInvariants<F extends IFace<any>>(
    scanLine: BalancedSearchTree<IInterval<F>>,
    eventQueue: BalancedSearchTree<IEvent<F>>
) {
    if (!debugging.enabled) return;
    let skipThrow = false;

    const intervals = scanLine.getAll();
    let prevInterval = intervals[0];
    if (prevInterval.left) {
        debugger;
        if (!skipThrow)
            throw new DebugError(
                "Left most interval shouldn't have a left border",
                prevInterval
            );
    }
    for (let interval of intervals.slice(1)) {
        if (prevInterval.right != interval.left) {
            debugger;
            if (!skipThrow)
                throw new DebugError("Consecutive intervals should share a border", {
                    prevInterval,
                    interval,
                });
        }

        if (interval.left && interval.right) {
            const a = interval.left;
            const b = interval.right;
            const side = sideOfSegment(a, b);
            if (side == Side.right) {
                const aStartSide = getSideOfLineOrPoint(b, a.start);
                const aEndSide = getSideOfLineOrPoint(b, a.end);
                const bStartSide = getSideOfLineOrPoint(a, b.start);
                const bEndSide = getSideOfLineOrPoint(a, b.end);
                debugger;
                if (!skipThrow)
                    throw new DebugError(
                        "The left boundary of an interval should be to its right's",
                        {interval, aStartSide, aEndSide, bStartSide, bEndSide}
                    );
            }
        }

        if (interval.left && interval.left.start.y > interval.left.end.y) {
            debugger;
            if (!skipThrow)
                throw new DebugError(
                    "An interval's boundaries should point upwards",
                    interval
                );
        }

        prevInterval = interval;
    }
}

/**
 * An error to which debug data can be attached
 */
export class DebugError<T> extends Error {
    public data: T;
    public constructor(message: string, data: T) {
        super(message);
        this.data = data;
    }
}
