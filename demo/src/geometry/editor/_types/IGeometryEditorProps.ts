import {GeometryEditorState} from "../GeometryEditorState";

export type IGeometryEditorProps = {
    readonly?: boolean;
    state: GeometryEditorState;

    height?: string | number;
    width?: string | number;
};
