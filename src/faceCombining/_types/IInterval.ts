import {IFace} from "../../data/_types/IFace";
import {IBoundary} from "./IBoundary";
import {ICrossEvent} from "./IEvent";
import {IMonotonePolygonSection} from "./IMonotonePolygonSection";

export type IInterval<F extends IFace<any>> = {
    /** The left boundary of this interval */
    left?: IBoundary<F>;
    /** The right boundary of this interval */
    right?: IBoundary<F>;
    /** The polygon section that this interval is accumulating */
    shape: IMonotonePolygonSection<F>;
    /** The event of where the left and right boundaries will intersect */
    intersection?: ICrossEvent<F>;
};
