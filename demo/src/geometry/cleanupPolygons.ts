import {doesIntersect, getSideOfLine, IPoint, pointEquals, Side} from "face-combiner";
import {IEditorFace} from "./editor/_types/IEditorFace";

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
        const l = face.polygon.length;
        let topLeftIndex = 0;
        let topLeft = face.polygon[topLeftIndex];
        for (let i = 1; i < l; i++) {
            const point = face.polygon[i];
            if (point.x < topLeft.x || (point.x == topLeft.x && point.y > topLeft.y)) {
                topLeft = point;
                topLeftIndex = i;
            }
        }

        const prev = face.polygon[(topLeftIndex + l - 1) % l];
        const next = face.polygon[(topLeftIndex + 1) % l];
        const isCounterClockWise =
            getSideOfLine({start: prev, end: topLeft}, next) == Side.left;

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
