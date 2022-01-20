import {IPoint} from "face-combiner";

/**
 * An event handler to handle keyboard interactions while the mouse is on the plane
 * @param evt The original keyboard event
 * @param worldPoint The mouse location in world coordinates
 */
export type IKeyboardHandler = (evt: KeyboardEvent, worldPoint: IPoint) => void;
