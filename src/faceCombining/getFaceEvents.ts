import {IFace} from "../data/_types/IFace";
import {IPoint} from "../data/_types/IPoint";
import {IEvent} from "./_types/IEvents";
import {IFaceSource} from "./_types/IFaceSource";

/**
 * Retrieves all the events for a given face (except fro crossing events with other faces)
 * @note Requires no three points to lie on one line (such intermediate points would be redundant anyhow)
 * @param face The face to retrieve all the events for
 * @param id The id for this face
 * @returns All the face's events
 */
export function getFaceEvents<F extends IFace<any>>(face: F, id: number): IEvent<F>[] {
    const events: IEvent<F>[] = [];

    const {polygon} = face;
    const source: IFaceSource<F> = {
        face,
        id,
    };
    let prev: IPoint = polygon[polygon.length - 2];
    let point: IPoint = polygon[polygon.length - 1];

    for (let next of polygon) {
        // Identify the event type (using symbolic counter-clockwise rotation)
        let type:
            | "start"
            | "leftContinue"
            | "rightContinue"
            | "stop"
            | "split"
            | "merge"
            | undefined;
        if (next.x > prev.x) {
            if (point.y < prev.y && point.y <= next.y) type = "start";
            else if (point.y >= prev.y && point.y > next.y) type = "merge";
        } else if (next.x < prev.x) {
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
        let event: IEvent<F>;
        if (type == "start")
            event = {
                type,
                point,
                source,
                left: prev,
                right: next,
            };
        else if (type == "merge")
            event = {
                type,
                point,
                source,
                left: prev,
                right: next,
            };
        else if (type == "split")
            event = {
                type,
                point,
                source,
                left: next,
                right: prev,
            };
        else if (type == "stop")
            event = {
                type,
                point,
                source,
                right: prev,
                left: next,
            };
        else if (type == "leftContinue")
            event = {
                type,
                point,
                source,
                prev: next,
                next: prev,
            };
        // type == "rightContinue"
        else
            event = {
                type,
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
