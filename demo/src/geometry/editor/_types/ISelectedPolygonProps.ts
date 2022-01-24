import {IPoint} from "face-combiner";
import {Field} from "model-react";
import {GeometryEditorState} from "../GeometryEditorState";

export type ISelectedPolygonProps = {
    state: GeometryEditorState;
    mousePos: Field<IPoint | null>;
    readonly?: boolean;
};
