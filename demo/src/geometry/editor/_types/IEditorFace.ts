import {IFace} from "face-combiner";

export type IEditorFace = IFace<string> & {
    color?: string;
    edgeColor?: string;
    trapsarencty?: number;
};
