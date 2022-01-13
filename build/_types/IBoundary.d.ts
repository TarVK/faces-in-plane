import { IFace } from "../util/_types/IFace";
import { IPoint } from "../util/_types/IPoint";
export declare type IBoundary<F extends IFace<any>> = {
    /** The start point of the boundary */
    start: IPoint;
    /** The expected end point of the boundary, but crossings may occur before then */
    end: IPoint;
    /** The face that this boundary came from */
    source: F;
    /** The unique id of this boundary, used for sorting */
    id: number;
    /** Whether it was the left or right edge of a face that makes up this boundary */
    side: "left" | "right";
};
//# sourceMappingURL=IBoundary.d.ts.map