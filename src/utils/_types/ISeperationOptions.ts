/** Advanced options for the separation function */
export type ISeparationOptions = {
    /** The distance to over shoot, such that the polygons are at least this far apart */
    margin?: number;
    /** If enabled,  we essentially calculate that 'if the move shape was infinitely far away along the "direction" variable, and moved it back to its current position, where would it first hit the stationary shape?' */
    skipIntersectionCheck?: boolean;
    /** Disallow moving the shape further into the direction than this distance, if skipIntersectionCheck is enabled, it will snap to the first available space*/
    maxDistance?: number;
};
