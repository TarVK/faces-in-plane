import {doesIntersect, getSideOfLine, pointEquals, Side} from "face-combiner";
import {IEditorFace} from "../geometry/editor/_types/IEditorFace";

/**
 * Cleans up the given polygons
 * @param faces THe polygons to cleanup
 * @returns The list of cleanedup polygons and the list of polygons that had intersections (and thus aren't allowed)
 */
export function cleanupPolygons(faces: IEditorFace[]): {
    valid: IEditorFace[];
    invalid: IEditorFace[];
} {
    const noDuplicates = faces.map(face => {
        let lastPoint = face.polygon[face.polygon.length - 1];
        const points = [];
        for (let point of face.polygon) {
            if (!pointEquals(lastPoint, point)) points.push(point);
            lastPoint = point;
        }

        return {
            source: face,
            corrected: {
                ...face,
                polygon: points,
            },
        };
    });

    const enoughPoints = noDuplicates.filter(
        ({corrected: face}) => face.polygon.length > 2
    );

    const counterClockwise = enoughPoints.map(({source, corrected: face}) => {
        let leftRotationCount = 0;
        let rightRotationCount = 0;
        let prev = face.polygon[face.polygon.length - 2];
        let point = face.polygon[face.polygon.length - 1];
        for (let next of face.polygon) {
            const side = getSideOfLine({start: prev, end: point}, next);
            if (side == Side.left) leftRotationCount++;
            else if (side == Side.right) rightRotationCount++;

            prev = point;
            point = next;
        }

        // TODO: fix this, a greater number of left rotations doesn't necessarily mean it's counterclockwise
        // Solution: perform an orientation test on the left top most point
        const isCounterClockWise = leftRotationCount > rightRotationCount;
        if (isCounterClockWise) return {source, corrected: face};
        else
            return {
                source,
                corrected: {
                    ...face,
                    polygon: [...face.polygon].reverse(),
                },
            };
    });

    const valid: IEditorFace[] = [];
    const invalid: IEditorFace[] = [];
    for (let {source, corrected: face} of counterClockwise) {
        if (selfIntersects(face)) invalid.push(source);
        else valid.push(face);
    }

    return {valid, invalid};
}

/**
 * Checks whether the given face selfintersects
 * @param face The face to be checked
 * @returns Whtether the face self intersects
 */
function selfIntersects(face: IEditorFace): boolean {
    let aStart = face.polygon[face.polygon.length - 1];
    for (let i = 0; i < face.polygon.length; i++) {
        const aEnd = face.polygon[i];
        const a = {start: aStart, end: aEnd};

        let bStart = face.polygon[face.polygon.length - 1];
        for (let j = 0; j < face.polygon.length; j++) {
            const bEnd = face.polygon[j];
            const b = {start: bStart, end: bEnd};
            if (i == j) continue;

            if (doesIntersect(a, b)) return true;
            if (getSideOfLine(a, bEnd) == Side.on) {
                const axis = a.start.x != b.start.x ? "x" : "y";
                const onSegment =
                    !(bEnd[axis] >= b.start[axis] && bEnd[axis] >= b.end[axis]) &&
                    !(bEnd[axis] <= b.start[axis] && bEnd[axis] <= b.end[axis]);
                if (onSegment) return true;
            }

            bStart = bEnd;
        }

        aStart = aEnd;
    }

    return false;
}
