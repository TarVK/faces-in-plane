import {IPoint} from "./IPoint";
import {ISimplePolygon} from "./ISimplePolygon";

export type IFace<T> = {
    polygon: ISimplePolygon;
    data: T;
};
