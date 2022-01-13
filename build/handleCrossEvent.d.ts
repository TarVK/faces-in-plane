import { IFace } from "./util/_types/IFace";
import { BalancedSearchTree } from "./util/BalancedSearchTree";
import { ICounter } from "./_types/ICounter";
import { ICrossEvent, IEvent } from "./_types/IEvent";
import { IInterval } from "./_types/IInterval";
/**
 * Handles the cross event by splitting the affected segments and adding continuation events to the queue
 * @param event The intersection event
 * @param scanLine The scanline that the affected intervals are on
 * @param eventQueue The queue of events to add the continuation events to
 * @param eventIdCounter The counter to retrieve the next event id
 */
export declare function handleCrossEvent<F extends IFace<any>>(event: ICrossEvent<F>, scanLine: BalancedSearchTree<IInterval<F>>, eventQueue: BalancedSearchTree<IEvent<F>>, eventIdCounter: ICounter): void;
//# sourceMappingURL=handleCrossEvent.d.ts.map