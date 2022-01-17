import {IPoint} from "face-combiner";

export type IGridProps = {
    gridSize: number;
    scale: number;
    offset: IPoint;
    type: "none" | "minor" | "major";
};
