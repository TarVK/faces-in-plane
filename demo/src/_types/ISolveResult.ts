import {Index} from "SAT";

export type ISolveResult =
    | {satisfiable: true; solution: Record<string, boolean>; duration: number}
    | {satisfiable: false; duration: number}
    | {error: {expected: string[]; index: Index; message: string}; duration: number};
