import {IPoint} from "face-combiner";
import {IBoundingBox} from "./_types/IBoundingBox";

/**
 * Checks whether the given point lies within the AABB
 * @param point The point to be checked
 * @param boundingBox The bounding box to be checked
 * @returns Whether the bounding box lies within the AABB
 */
export function isPointInAABB(
    point: IPoint,
    {xMax, xMin, yMax, yMin}: IBoundingBox
): boolean {
    return point.x >= xMin && point.x <= xMax && point.y >= yMin && point.y <= yMax;
}
