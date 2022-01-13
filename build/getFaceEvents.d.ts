import { IFace } from "./util/_types/IFace";
import { ICounter } from "./_types/ICounter";
import { IEvent } from "./_types/IEvent";
/**
 * Retrieves all the events for a given face (except fro crossing events with other faces)
 * @note Requires no three points to lie on one line (such intermediate points would be redundant anyhow)
 * @param face The face to retrieve all the events for
 * @param eventIdCounter The counter to retrieve the next event id
 * @returns All the face's events
 */
export declare function getFaceEvents<F extends IFace<any>>(face: F, eventIdCounter: ICounter): IEvent<F>[];
//# sourceMappingURL=getFaceEvents.d.ts.map