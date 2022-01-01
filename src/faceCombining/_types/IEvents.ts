import {IFace} from "../../data/_types/IFace";
import {IPoint} from "../../data/_types/IPoint";
import {ISegment} from "../../data/_types/ISegment";
import {IFaceSource} from "./IFaceSource";
import {IInterval} from "./IInterval";

/** Any possible event type */
export type IEvent<F extends IFace<any>> =
    | IStartEvent<F>
    | ILeftContinueEvent<F>
    | IRightContinueEvent<F>
    | ISplitEvent<F>
    | IStopEvent<F>
    | IMergeEvent<F>
    | ICrossEvent<F>;

export type IPolygonEventBase<F extends IFace<any>> = {
    /** The start point of a interval */
    point: IPoint;
    /** The associated source face that created the event */
    source: IFaceSource<F>;
};

export type IStartEvent<F extends IFace<any>> = {
    /** The event type */
    type: "start";
    /** The next point above that forms the left line */
    left: IPoint;
    /** The next point above that forms the right line */
    right: IPoint;
} & IPolygonEventBase<F>;

export type ILeftContinueEvent<F extends IFace<any>> = {
    /** The event type */
    type: "leftContinue";
    /** The previous point of the line that's continued */
    prev: IPoint;
    /** The end point of the next line segment */
    next: IPoint;
} & IPolygonEventBase<F>;

export type IRightContinueEvent<F extends IFace<any>> = {
    /** The event type */
    type: "rightContinue";
    /** The previous point of the line that's continued */
    prev: IPoint;
    /** The end point of the next line segment */
    next: IPoint;
} & IPolygonEventBase<F>;

export type IStopEvent<F extends IFace<any>> = {
    /** The event type */
    type: "stop";
    /** The previous point below that forms the left line */
    left: IPoint;
    /** The previous point below that forms the right line */
    right: IPoint;
} & IPolygonEventBase<F>;

export type ISplitEvent<F extends IFace<any>> = {
    /** The event type */
    type: "split";
    /** The next point above that forms the left line */
    left: IPoint;
    /** The next point above that forms the right line */
    right: IPoint;
} & IPolygonEventBase<F>;

export type IMergeEvent<F extends IFace<any>> = {
    /** The event type */
    type: "merge";
    /** The previous point below that forms the left line */
    left: IPoint;
    /** The previous point below that forms the right line */
    right: IPoint;
} & IPolygonEventBase<F>;

export type ICrossEvent<F extends IFace<any>> = {
    /** The event type */
    type: "cross";
    /** The point at which the lines cross */
    point: IPoint;
    /** The interval whose boundaries are going to intersect at the given point */
    interval: IInterval<F>;
};
