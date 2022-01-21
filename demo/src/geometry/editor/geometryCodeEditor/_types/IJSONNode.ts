import {IJSON} from "./IJSON";

export type IJSONTextNode = string | string[];

export type IJSONValueNode = {
    /** THe children of this node */
    children: (IJSONTextNode | IJSONValueNode)[];
    /** The value that this node stores */
    value: IJSON;
};
