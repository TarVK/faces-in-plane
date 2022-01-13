"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesIntersect = void 0;
const getSideOfLine_1 = require("./getSideOfLine");
/**
 * Checks whether the two segments strictly intersect, I.e. have point on either side of the segments (not only overlap)
 * @param a The first segment to be used
 * @param b The second segment to be used
 * @returns Whether the segments cross
 */
function doesIntersect(a, b) {
    return ((0, getSideOfLine_1.getSideOfLine)(a, b.start) * (0, getSideOfLine_1.getSideOfLine)(a, b.end) < 0 &&
        (0, getSideOfLine_1.getSideOfLine)(b, a.start) * (0, getSideOfLine_1.getSideOfLine)(b, a.end) < 0);
}
exports.doesIntersect = doesIntersect;
//# sourceMappingURL=doesIntersect.js.map