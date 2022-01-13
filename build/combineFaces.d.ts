import { IFace } from "./util/_types/IFace";
/**
 * Takes a set of faces whose edges may cross, and combines them into a set of non-crossing polygons that retain the same information
 * @param faces The faces the be combined
 * @returns The combined faces
 */
export declare function combineFaces<F extends IFace<any>>(faces: F[]): IFace<F[]>[];
//# sourceMappingURL=combineFaces.d.ts.map