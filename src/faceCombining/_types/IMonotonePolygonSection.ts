import {IPoint} from "../../data/_types/IPoint";

export type IMonotonePolygonSection<D> = {
    /** The points forming the left wall of this section */
    left: IPoint[];
    /** The points forming the right wall of this section */
    right: IPoint[];
    /** THe polygon's data */
    data: D[];
    /** The polygon to the bottom left of this section */
    bottomLeft?: IMonotonePolygonSection<D>;
    /** The polygon to the bottom right of this section */
    bottomRight?: IMonotonePolygonSection<D>;
    /** The polygon to the top left of this section */
    topLeft?: IMonotonePolygonSection<D>;
    /** The polygon to the top right of this section */
    topRight?: IMonotonePolygonSection<D>;
};
