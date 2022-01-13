import { IFace } from "./util/_types/IFace";
import { IMonotonePolygonSection } from "./_types/IMonotonePolygonSection";
/**
 * Generates the full list of polygons given a set of sections, removing empty polygons and the outerface polygon
 * @param sections The sections of the faces. Note: multiple sections of the same face my be present
 * @returns The generated faces
 */
export declare function generateFaces<F extends IFace<any>>(sections: Set<IMonotonePolygonSection<F>>): IFace<F[]>[];
//# sourceMappingURL=generateFaces.d.ts.map