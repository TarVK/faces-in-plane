import {IPoint} from "../../data/_types/IPoint";

/** Any possible event type */
export type IEvent<D> =
    | IStartEvent<D>
    | ILeftContinueEvent<D>
    | IRightContinueEvent<D>
    | ISplitEvent<D>
    | IStopEvent
    | IMergeEvent
    | ICrossEvent;

export type IStartEvent<D> = {
    /** The event type */
    type: "start";
    /** The start point of a interval */
    point: IPoint;
    /** The next point above that starts the left boundary */
    left: IPoint;
    /** The next point above that starts the right boundary*/
    right: IPoint;
    /** The associated data of the face */
    data: D;
};

export type ILeftContinueEvent<D> = {
    /** The event type */
    type: "leftContinue";
    /** The start point of the next line segment */
    point: IPoint;
    /** The previous point of the line that's continued */
    prev: IPoint;
    /** The end point of the next line segment */
    next: IPoint;
    /** The associated data of the face */
    data: D;
};

export type IRightContinueEvent<D> = {
    /** The event type */
    type: "rightContinue";
    /** The start point of the next line segment */
    point: IPoint;
    /** The previous point of the line that's continued */
    prev: IPoint;
    /** The end point of the next line segment */
    next: IPoint;
    /** The associated data of the face */
    data: D;
};

export type IStopEvent = {
    /** The event type */
    type: "stop";
    /** The end point of the interval */
    point: IPoint;
};

export type ISplitEvent<D> = {
    /** The event type */
    type: "split";
    /** The point at which the interval splits into two */
    point: IPoint;
    /** The next point above that starts the new left boundary */
    left: IPoint;
    /** The next point above that starts the new right boundary*/
    right: IPoint;
    /** The associated data of the face */
    data: D;
};

export type IMergeEvent = {
    /** The event type */
    type: "merge";
    /** The point at which the intervals merge together */
    point: IPoint;
};

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
