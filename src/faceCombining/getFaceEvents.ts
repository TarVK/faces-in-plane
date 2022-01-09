import {IFace} from "../data/_types/IFace";
import {IPoint} from "../data/_types/IPoint";
import {getSideOfLine} from "../utils/getSideOfLine";
import {Side} from "../utils/Side";
import {ICounter} from "./_types/ICounter";
import {IEvent} from "./_types/IEvent";

/**
 * Retrieves all the events for a given face (except fro crossing events with other faces)
 * @note Requires no three points to lie on one line (such intermediate points would be redundant anyhow)
 * @param face The face to retrieve all the events for
 * @param eventIdCounter The counter to retrieve the next event id
 * @returns All the face's events
 */
export function getFaceEvents<F extends IFace<any>>(
    face: F,
    eventIdCounter: ICounter
): IEvent<F>[] {
    const events: IEvent<F>[] = [];

    const source = face;
    const {polygon} = face;
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
            else if (point.y >= prev.y && point.y > next.y) type = "merge";
        }

        if (!type) {
            if (next.y > point.y) type = "rightContinue";
            else if (next.y < point.y) type = "leftContinue";
            else if (next.x > point.x) type = "rightContinue";
            else type = "leftContinue";
        }

        // Create the events
        if (type == "start" || type == "split") {
            events.push({
                type: "line",
                point,
                end: prev,
                side: "left",
                id: eventIdCounter(),
                source,
            });
            events.push({
                type: "line",
                point,
                end: next,
                side: "right",
                id: eventIdCounter(),
                source,
            });
        } else if (type == "merge" || type == "stop") {
            events.push({
                type: "lineEnd",
                point,
                id: eventIdCounter(),
            });
        } else {
            events.push({
                type: "line",
                point,
                end: type == "leftContinue" ? prev : next,
                side: type == "leftContinue" ? "left" : "right",
                id: eventIdCounter(),
                source,
            });
        }

        // Update the points for the next iteration
        prev = point;
        point = next;
    }

    return events;
}
