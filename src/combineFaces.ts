import {IFace} from "./util/_types/IFace";
import {IPoint} from "./util/_types/IPoint";
import {BalancedSearchTree} from "./util/BalancedSearchTree";
import {getSideOfLine} from "./util/getSideOfLine";
import {pointEquals} from "./util/pointEquals";
import {Side} from "./util/Side";
import {getFaceEvents} from "./getFaceEvents";
import {IEvent, ILineEvent, IStopEvent} from "./_types/IEvent";
import {IInterval} from "./_types/IInterval";
import {IMonotonePolygonSection} from "./_types/IMonotonePolygonSection";
import {generateFaces} from "./generateFaces";
import {handleCrossEvent} from "./handleCrossEvent";
import {handlePolygonEvents} from "./handlePolygonEvents";
import {getSideOfLineOrPoint} from "./utils";

/**
 * Takes a set of faces whose edges may cross, and combines them into a set of non-crossing polygons that retain the same information
 * @param faces The faces the be combined
 * @returns The combined faces
 */
export function combineFaces<F extends IFace<any>>(faces: F[]): IFace<F[]>[] {
    let id = 0;
    const eventIdCounter = () => id++;

    // Sort events increasingly, lexicographically on y, then x coordinates, then prioritize cross events.
    const events = new BalancedSearchTree<IEvent<F>>((pa, pb) => {
        const {type: ta, point: a, id: ida} = pa,
            {type: tb, point: b, id: idb} = pb;
        if (a.y != b.y) return a.y - b.y;
        if (a.x != b.x) return a.x - b.x;

        if (ta == "cross" && tb != "cross") return Side.left;
        if (ta != "cross" && tb == "cross") return Side.right;

        // Sort all events with the same points arbitrarily
        return ida - idb;
    });

    for (let face of faces) {
        const faceEvents = getFaceEvents(face, eventIdCounter);
        for (let faceEvent of faceEvents) events.insert(faceEvent);
    }

    // Perform the scanline sweep
    const scanLine = new BalancedSearchTree<IInterval<F>>(({left: a}, {left: b}) => {
        if (!a && !b) return 0; // There is only 1 interval with no  left boundary on any scanline
        if (!a) return -1;
        if (!b) return 1;

        const aStartSide = getSideOfLineOrPoint(b, a.start);
        const aEndSide = getSideOfLineOrPoint(b, a.end);

        // aEndSide != -aStartSide prioritizes b's result in case a's points are on opposite sides of b
        if (aStartSide != Side.on && aEndSide != -aStartSide) return aStartSide;
        if (aEndSide != Side.on && aEndSide != -aStartSide) return aEndSide;

        const bStartSide = getSideOfLineOrPoint(a, b.start);
        if (bStartSide != Side.on) return -bStartSide;
        const bEndSide = getSideOfLineOrPoint(a, b.end);
        if (bEndSide != Side.on) return -bEndSide;

        // Sort all intervals with the same left boundary arbitrarily
        return a.id - b.id;
    });
    const outerInterval: IInterval<F> = {
        shape: {
            left: [],
            right: [],
            sources: [],
        },
    };
    scanLine.insert(outerInterval);
    const sections = new Set<IMonotonePolygonSection<F>>();

    let event: IEvent<F> | undefined;
    while ((event = events.getMin())) {
        events.delete(event);
        if (event.type == "cross")
            handleCrossEvent(event, scanLine, events, eventIdCounter);
        else {
            const point: IPoint | undefined = event.point;
            const eventsAtPoint: (ILineEvent<F> | IStopEvent<F>)[] = [event];

            let nextEvent: IEvent<F> | undefined;
            while ((nextEvent = events.getMin())) {
                if (nextEvent.type == "cross") break;
                if (!pointEquals(nextEvent.point, point)) break;

                events.delete(nextEvent);
                eventsAtPoint.push(nextEvent);
            }

            handlePolygonEvents(
                eventsAtPoint,
                scanLine,
                sections,
                events,
                eventIdCounter
            );
        }
    }

    if (scanLine.getAll().length != 1)
        throw new Error(
            "Something went wrong, scanline should've finished with a single itnerval"
        );

    return generateFaces(sections);
}
