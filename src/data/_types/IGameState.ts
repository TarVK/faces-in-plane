import { IFace } from "./IFace";
import {ISimplePolygon} from "./ISimplePolygon";

/**
 * Represents the state of the game
 */
export type IGameState = {
    faces: IFace<any>[];
};
