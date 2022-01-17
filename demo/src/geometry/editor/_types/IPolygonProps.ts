import {IPoint} from "face-combiner";
import {Field} from "model-react";
import {GeometryEditorState} from "../GeometryEditorState";
import {IEditorFace} from "./IEditorFace";

export type IPolygonProps = {
    state: GeometryEditorState;
    polygon: Field<IEditorFace>;
    opacity?: number;
    points?: IPoint[];
};
