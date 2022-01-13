"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineFaces = void 0;
const BalancedSearchTree_1 = require("./util/BalancedSearchTree");
const getSideOfLine_1 = require("./util/getSideOfLine");
const pointEquals_1 = require("./util/pointEquals");
const Side_1 = require("./util/Side");
const getFaceEvents_1 = require("./getFaceEvents");
const generateFaces_1 = require("./generateFaces");
const handleCrossEvent_1 = require("./handleCrossEvent");
const handlePolygonEvents_1 = require("./handlePolygonEvents");
/**
 * Takes a set of faces whose edges may cross, and combines them into a set of non-crossing polygons that retain the same information
 * @param faces The faces the be combined
 * @returns The combined faces
 */
function combineFaces(faces) {
    let id = 0;
    const eventIdCounter = () => id++;
    // Sort events increasingly, lexicographically on y, then x coordinates, then prioritize cross events.
    const events = new BalancedSearchTree_1.BalancedSearchTree((pa, pb) => {
        const { type: ta, point: a, id: ida } = pa, { type: tb, point: b, id: idb } = pb;
        if (a.y != b.y)
            return a.y - b.y;
        if (a.x != b.x)
            return a.x - b.x;
        if (ta == "cross" && tb != "cross")
            return -1;
        if (ta != "cross" && tb == "cross")
            return 1;
        // Sort all events with the same points arbitrarily
        return ida - idb;
    });
    for (let face of faces) {
        const faceEvents = (0, getFaceEvents_1.getFaceEvents)(face, eventIdCounter);
        for (let faceEvent of faceEvents)
            events.insert(faceEvent);
    }
    // Perform the scanline sweep
    const scanLine = new BalancedSearchTree_1.BalancedSearchTree(({ left: a }, { left: b }) => {
        if (!a && !b)
            return 0; // There is only 1 interval with no  left boundary on any scanline
        if (!a)
            return -1;
        if (!b)
            return 1;
        const aStartSide = (0, getSideOfLine_1.getSideOfLine)(b, a.start);
        const aEndSide = (0, getSideOfLine_1.getSideOfLine)(b, a.end);
        // aEndSide != -aStartSide prioritizes b's result in case a's points are on opposite sides of b
        if (aStartSide != Side_1.Side.on && aEndSide != -aStartSide)
            return aStartSide;
        if (aEndSide != Side_1.Side.on && aEndSide != -aStartSide)
            return aEndSide;
        const bStartSide = (0, getSideOfLine_1.getSideOfLine)(a, b.start);
        if (bStartSide != Side_1.Side.on)
            return -bStartSide;
        const bEndSide = (0, getSideOfLine_1.getSideOfLine)(a, b.end);
        if (bEndSide != Side_1.Side.on)
            return -bEndSide;
        // Sort all intervals with the same left boundary arbitrarily
        return a.id - b.id;
    });
    const outerInterval = {
        shape: {
            left: [],
            right: [],
            sources: [],
        },
    };
    scanLine.insert(outerInterval);
    const sections = new Set();
    let event;
    while ((event = events.getMin())) {
        events.delete(event);
        if (event.type == "cross")
            (0, handleCrossEvent_1.handleCrossEvent)(event, scanLine, events, eventIdCounter);
        else {
            const point = event.point;
            const eventsAtPoint = [event];
            let nextEvent;
            while ((nextEvent = events.getMin())) {
                if (nextEvent.type == "cross")
                    break;
                if (!(0, pointEquals_1.pointEquals)(nextEvent.point, point))
                    break;
                events.delete(nextEvent);
                eventsAtPoint.push(nextEvent);
            }
            (0, handlePolygonEvents_1.handlePolygonEvents)(eventsAtPoint, scanLine, sections, events, eventIdCounter);
        }
    }
    return (0, generateFaces_1.generateFaces)(sections);
}
exports.combineFaces = combineFaces;
//# sourceMappingURL=combineFaces.js.map