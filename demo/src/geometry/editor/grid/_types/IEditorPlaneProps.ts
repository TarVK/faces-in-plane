import {GeometryEditorState} from "../../GeometryEditorState";
import {IInteractionHandler} from "./IInteractionHandler";
import {IKeyboardHandler} from "./IKeyboardHandler";

export type IEditorPlaneProps = {
    state: GeometryEditorState;
    onMouseDown?: IInteractionHandler;
    onMouseUp?: IInteractionHandler;
    onMouseMove?: IInteractionHandler;

    onKeyDown?: IKeyboardHandler;
    onKeyUp?: IKeyboardHandler;

    height?: string | number;
    width?: string | number;
};
