import {IFace} from "../../data/_types/IFace";
import {IPoint} from "../../data/_types/IPoint";
import {IFaceSource} from "./IFaceSource";
import {IMonotonePolygonSection} from "./IMonotonePolygonSection";

export type IInterval<F extends IFace<any>> = {
    /** The left boundary of this interval */
    left?: IBoundary<F>;
    /** The right boundary of this interval */
    right?: IBoundary<F>;
    /** The polygon section that this interval is accumulating */
    shape: IMonotonePolygonSection<F>;
    /** The input faces that make up the face that this interval is part of */
    sources: IFaceSource<F>[];
};

export type IBoundary<F extends IFace<any>> = {
    /** The start point of the boundary */
    start: IPoint;
    /** The expected end point of the boundary, but crossings may occur before then */
    end: IPoint;
    /** The face that this boundary came from */
    source: IFaceSource<F>;
    /** Whether it was the left or right edge of a face. E.g. if this says left, the polygon formed by the interval to the left of this should not have the associated data of this boundary */
    side: "left" | "right";
};
