import {IFace} from "../data/_types/IFace";
import {IPoint} from "../data/_types/IPoint";
import {getSideOfLine} from "../utils/getSideOfLine";
import {Side} from "../utils/Side";
import {ICounter} from "./_types/ICounter";
import {IEvent} from "./_types/IEvents";
import {IFaceSource} from "./_types/IFaceSource";

/**
 * Retrieves all the events for a given face (except fro crossing events with other faces)
 * @note Requires no three points to lie on one line (such intermediate points would be redundant anyhow)
 * @param face The face to retrieve all the events for
 * @param id The id for this face
 * @param eventIdCounter The counter to retrieve the next event id
 * @returns All the face's events
 */
export function getFaceEvents<F extends IFace<any>>(
    face: F,
    id: number,
    eventIdCounter: ICounter
): IEvent<F>[] {
    const events: IEvent<F>[] = [];

    const {polygon} = face;
    const source: IFaceSource<F> = {
        face,
        id,
    };
    let prev: IPoint = polygon[polygon.length - 2];
    let point: IPoint = polygon[polygon.length - 1];

    for (let next of polygon) {
        const isLeftTurn = getSideOfLine({start: prev, end: point}, next) == Side.left;

        // Identify the event type (using symbolic counter-clockwise rotation)
        let type:
            | "start"
            | "leftContinue"
            | "rightContinue"
            | "stop"
            | "split"
            | "merge"
            | undefined;
        if (isLeftTurn) {
            if (point.y < prev.y && point.y <= next.y) type = "start";
            else if (point.y > prev.y && point.y >= next.y) type = "stop";
        } else {
            if (point.y <= prev.y && point.y < next.y) type = "split";
            else if (point.y > prev.y && point.y >= next.y) type = "stop";
        }

        if (!type) {
            if (next.y > point.y) type = "rightContinue";
            else if (next.y < point.y) type = "leftContinue";
            else if (next.x > point.x) type = "rightContinue";
            else type = "leftContinue";
        }

        // Create the event
        const id = eventIdCounter();
        let event: IEvent<F>;
        if (type == "start")
            event = {
                type,
                id,
                point,
                source,
                left: prev,
                right: next,
            };
        else if (type == "merge")
            event = {
                type,
                id,
                point,
                source,
                left: prev,
                right: next,
            };
        else if (type == "split")
            event = {
                type,
                id,
                point,
                source,
                left: next,
                right: prev,
            };
        else if (type == "stop")
            event = {
                type,
                id,
                point,
                source,
                right: prev,
                left: next,
            };
        else if (type == "leftContinue")
            event = {
                type,
                id,
                point,
                source,
                prev: next,
                next: prev,
            };
        // type == "rightContinue"
        else
            event = {
                type,
                id,
                point,
                source,
                prev,
                next,
            };

        events.push(event);

        // Update the points for the next iteration
        prev = point;
        point = next;
    }

    return events;
}
