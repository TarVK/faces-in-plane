import {IPoint} from "../../data/_types/IPoint";
import {ISegment} from "../../data/_types/ISegment";

export type ITrapezoid<T = unknown> = {
    left: IPoint;
    right: IPoint;
    top: ISegment & T;
    bottom: ISegment & T;
    parents: ITrapezoidalDecompositionNode<T>[];
    /* The neighbors of the trapezoid */
    /** Right top neighbor */
    RTN?: ITrapezoid<T>;
    /** Right bottom neighbor */
    RBN?: ITrapezoid<T>;
    /** Left top neighbor */
    LTN?: ITrapezoid<T>;
    /** Left bottom neighbor */
    LBN?: ITrapezoid<T>;
};

export type ITrapezoidalDecompositionNode<T = unknown> =
    | IPointNode<T>
    | ISegmentNode<T>
    | ITrapezoid<T>;

export type IPointNode<T = unknown> = {
    point: IPoint;
    left: ITrapezoidalDecompositionNode<T>;
    right: ITrapezoidalDecompositionNode<T>;
};

export type ISegmentNode<T = unknown> = {
    segment: ISegment & T;
    above: ITrapezoidalDecompositionNode<T>;
    below: ITrapezoidalDecompositionNode<T>;
};
