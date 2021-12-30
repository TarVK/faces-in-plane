import {IPoint} from "../../data/_types/IPoint";

/** Any possible event type */
export type IEvent<D> =
    | IStartEvent<D>
    | ILeftContinueEvent<D>
    | IRightContinueEvent<D>
    | ISplitEvent<D>
    | IStopEvent<D>
    | IMergeEvent<D>
    | ICrossEvent;

export type IPolygonEventBase<D> = {
    /** The start point of a interval */
    point: IPoint;
    /** The associated data of the face */
    data: D;
};

export type IStartEvent<D> = {
    /** The event type */
    type: "start";
    /** The next point above that starts the left boundary */
    left: IPoint;
    /** The next point above that starts the right boundary*/
    right: IPoint;
} & IPolygonEventBase<D>;

export type ILeftContinueEvent<D> = {
    /** The event type */
    type: "leftContinue";
    /** The previous point of the line that's continued */
    prev: IPoint;
    /** The end point of the next line segment */
    next: IPoint;
} & IPolygonEventBase<D>;

export type IRightContinueEvent<D> = {
    /** The event type */
    type: "rightContinue";
    /** The previous point of the line that's continued */
    prev: IPoint;
    /** The end point of the next line segment */
    next: IPoint;
} & IPolygonEventBase<D>;

export type IStopEvent<D> = {
    /** The event type */
    type: "stop";
} & IPolygonEventBase<D>;

export type ISplitEvent<D> = {
    /** The event type */
    type: "split";
    /** The next point above that starts the new left boundary */
    left: IPoint;
    /** The next point above that starts the new right boundary*/
    right: IPoint;
} & IPolygonEventBase<D>;

export type IMergeEvent<D> = {
    /** The event type */
    type: "merge";
} & IPolygonEventBase<D>;

export type ICrossEvent = {
    /** The event type */
    type: "cross";
    /** The point at which the lines cross */
    point: IPoint;
    /** The lower point of the left segment that causes that crosses */
    left: IPoint;
    /** The lower point of the right segment that causes that crosses */
    right: IPoint;
};
