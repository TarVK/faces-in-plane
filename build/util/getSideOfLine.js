"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSideOfLine = void 0;
const Side_1 = require("./Side");
/**
 * Checks whether r lies to the left (-1), right (1) or on (0) segment pq.
 * @param segment The segment to check
 * @param r The point to check
 * @returns The side that the point is on
 */
function getSideOfLine({ start, end }, r) {
    const res = (end.x - start.x) * (r.y - start.y) - (end.y - start.y) * (r.x - start.x);
    return res < 0 ? Side_1.Side.right : res > 0 ? Side_1.Side.left : Side_1.Side.on;
}
exports.getSideOfLine = getSideOfLine;
//# sourceMappingURL=getSideOfLine.js.map