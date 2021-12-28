import {IPoint} from "../../data/_types/IPoint";
import {IMonotonePolygonSection} from "./IMonotonePolygonSection";

export type IInterval<D> = {
    /** The left boundary of this interval */
    left?: IBoundary<D>;
    /** The right boundary of this interval */
    right?: IBoundary<D>;
    /** The polygon section that this interval is accumulating */
    shape: IMonotonePolygonSection<D>;
    /** The data of the polygon of the interval */
    data: D[];
};

export type IBoundary<D> = {
    /** The start point of the boundary */
    start: IPoint;
    /** The expected end point of the boundary, but crossings may occur before then */
    end: IPoint;
    /** The data of the face that this boundary originates from */
    data: D;
    /** Whether it was the left or right edge of a face. E.g. if this says left, the polygon formed by the interval to the left of this should not have the associated data of this boundary */
    side: "left" | "right";
};
