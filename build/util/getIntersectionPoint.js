"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntersectionPoint = void 0;
/**
 * Retrieves the intersection point of the line extensions of the given segments
 * @param a The first segment to use
 * @param b The second segment to use
 * @returns The intersection point of the two lines
 */
function getIntersectionPoint(a, b) {
    const dxA = a.start.x - a.end.x;
    const slopeA = (a.start.y - a.end.y) / dxA;
    const interceptA = a.start.y - slopeA * a.start.x;
    const dxB = b.start.x - b.end.x;
    const slopeB = (b.start.y - b.end.y) / dxB;
    const interceptB = b.start.y - slopeB * b.start.x;
    if (dxA == 0 && dxB == 0)
        return { x: a.start.x, y: Math.max(a.start.y, b.start.y) };
    if (dxA == 0)
        return {
            x: a.start.x,
            y: slopeB * a.start.x + interceptB,
        };
    if (dxB == 0)
        return {
            x: b.start.x,
            y: slopeA * b.start.x + interceptA,
        };
    const x = (interceptA - interceptB) / (slopeB - slopeA);
    const y = slopeA * x + interceptA;
    return { x, y };
}
exports.getIntersectionPoint = getIntersectionPoint;
//# sourceMappingURL=getIntersectionPoint.js.map