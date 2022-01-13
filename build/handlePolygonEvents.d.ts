import { IFace } from "./util/_types/IFace";
import { BalancedSearchTree } from "./util/BalancedSearchTree";
import { ICounter } from "./_types/ICounter";
import { IEvent, ILineEvent, IStopEvent } from "./_types/IEvent";
import { IInterval } from "./_types/IInterval";
import { IMonotonePolygonSection } from "./_types/IMonotonePolygonSection";
/**
 * Handles the polygon events at a specific point
 * @param events All the polygon events with the same x and y coordinate
 * @param scanLine The scanline that the intervals are on
 * @param output The output set of polygon sections
 * @param eventQueue The event queue to add cross events to
 * @param eventIdCounter The counter to retrieve the next event id
 */
export declare function handlePolygonEvents<F extends IFace<any>>(events: (ILineEvent<F> | IStopEvent<F>)[], scanLine: BalancedSearchTree<IInterval<F>>, output: Set<IMonotonePolygonSection<F>>, eventQueue: BalancedSearchTree<IEvent<F>>, eventIdCounter: ICounter): void;
//# sourceMappingURL=handlePolygonEvents.d.ts.map