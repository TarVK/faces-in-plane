import {IFace} from "../../data/_types/IFace";
import {IPoint} from "../../data/_types/IPoint";

export type IMonotonePolygonSection<F extends IFace<any>> = {
    /** The points forming the left wall of this section */
    left: IPoint[];
    /** The points forming the right wall of this section */
    right: IPoint[];
    /** The faces that formed this polygon */
    sources: F[];
    /** The polygon to the bottom left of this section */
    bottomLeft?: IMonotonePolygonSection<F>;
    /** The polygon to the bottom right of this section */
    bottomRight?: IMonotonePolygonSection<F>;
    /** The polygon to the top left of this section */
    topLeft?: IMonotonePolygonSection<F>;
    /** The polygon to the top right of this section */
    topRight?: IMonotonePolygonSection<F>;
};
