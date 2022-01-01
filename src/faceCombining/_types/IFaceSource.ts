import {IFace} from "../../data/_types/IFace";

/** Data to keep track of the source face */
export type IFaceSource<F extends IFace<any>> = {
    /** The face itself */
    face: F;
    /** The id for this face */
    id: number;
};
