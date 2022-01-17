import {GeometryEditorState} from "../GeometryEditorState";
import {IInteractionHandler} from "./IInteractionHandler";

export type IEditorPlaneProps = {
    state: GeometryEditorState;
    onMouseDown?: IInteractionHandler;
    onMouseUp?: IInteractionHandler;
    onMouseMove?: IInteractionHandler;

    height?: string | number;
    width?: string | number;
};
