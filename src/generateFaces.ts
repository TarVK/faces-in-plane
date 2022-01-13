import {IFace} from "./util/_types/IFace";
import {IPoint} from "./util/_types/IPoint";
import {pointEquals} from "./util/pointEquals";
import {IMonotonePolygonSection} from "./_types/IMonotonePolygonSection";

/**
 * Generates the full list of polygons given a set of sections, removing empty polygons and the outerface polygon
 * @param sections The sections of the faces. Note: multiple sections of the same face my be present
 * @returns The generated faces
 */
export function generateFaces<F extends IFace<any>>(
    sections: Set<IMonotonePolygonSection<F>>
): IFace<F[]>[] {
    const output: IFace<F[]>[] = [];
    for (let section of sections) {
        if (section.sources.length == 0) continue;

        const points: IPoint[] = [];
        exploreSection(section, undefined, sections, points);

        const noDuplicates: IPoint[] = [];
        let lastPoint: IPoint = points[points.length - 1];
        for (let point of points) {
            if (!pointEquals(lastPoint, point)) noDuplicates.push(point);
            lastPoint = point;
        }

        if (noDuplicates.length <= 2) continue;

        const face: IFace<F[]> = {
            data: section.sources,
            polygon: noDuplicates,
        };
        output.push(face);
    }

    return output;
}

/**
 * Recursively explorers a given section and adds the found points to the list
 * @param section The section to be explored
 * @param parent The parent to not backtrack into
 * @param output The list of points to output
 * @returns Whether this was a newly found section (as opposed to one already handled in case of a loop)
 */
function exploreSection<F extends IFace<any>>(
    section: IMonotonePolygonSection<F>,
    parent: IMonotonePolygonSection<F> | undefined,
    remainingSections: Set<IMonotonePolygonSection<F>>,
    output: IPoint[]
) {
    // If the section was already visited we encountered a loop
    if (!remainingSections.has(section)) return;
    remainingSections.delete(section);

    const {topLeft, bottomLeft, bottomRight, topRight} = section;

    let start = 0;
    if (parent) {
        if (topLeft == parent) start = 0;
        else if (bottomLeft == parent) start = 1;
        else if (bottomRight == parent) start = 2;
        else if (topRight == parent) start = 3;
    }

    for (let i = 0; i < 4; i++) {
        const side = (i + start) % 4;
        if (side == 0) {
            if (topLeft && topLeft != parent)
                exploreSection(topLeft, section, remainingSections, output);
        } else if (side == 1) {
            if (bottomLeft && bottomLeft != parent)
                exploreSection(bottomLeft, section, remainingSections, output);
        } else if (side == 2) {
            if (bottomRight && bottomRight != parent)
                exploreSection(bottomRight, section, remainingSections, output);
        } else if (side == 3) {
            if (topRight && topRight != parent)
                exploreSection(topRight, section, remainingSections, output);
        }

        if (side == 0) output.push(...section.left.reverse());
        else if (side == 2) output.push(...section.right);
    }
}
