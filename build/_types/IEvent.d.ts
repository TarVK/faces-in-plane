import { IFace } from "../util/_types/IFace";
import { IPoint } from "../util/_types/IPoint";
import { IInterval } from "./IInterval";
export declare type IEvent<F extends IFace<any>> = IStopEvent<F> | ICrossEvent<F> | ILineEvent<F>;
export declare type IStopEvent<F extends IFace<any>> = {
    /** The event type */
    type: "lineEnd";
    /** The start point of a segment */
    point: IPoint;
    /** A unique id for this line event, used for sorting */
    id: number;
};
export declare type ILineEvent<F extends IFace<any>> = {
    /** The event type */
    type: "line";
    /** Whether it was the left or right edge of a face */
    side: "left" | "right";
    /** The start point of a segment */
    point: IPoint;
    /** The end point of the line (the point with the higher y value) */
    end: IPoint;
    /** A unique id for this line event, used for sorting */
    id: number;
    /** The associated source face that created the event */
    source: F;
};
export declare type ICrossEvent<F extends IFace<any>> = {
    /** The event type */
    type: "cross";
    /** The point at which the lines of the interval cross */
    point: IPoint;
    /** The interval whose boundaries are going to cross */
    interval: IInterval<F>;
    /** A unique id for this line event, used for sorting */
    id: number;
};
//# sourceMappingURL=IEvent.d.ts.map