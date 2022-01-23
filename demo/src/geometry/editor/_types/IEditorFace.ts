import {IFace} from "face-combiner";

export type IEditorFace = IFace<any> & {
    color?: string;
    edgeColor?: string;
    pointColor?: string;

    opacity?: number;
    edgeOpacity?: number;
    pointOpacity?: number;

    edgeSize?: number;
    pointSize?: number;
};
