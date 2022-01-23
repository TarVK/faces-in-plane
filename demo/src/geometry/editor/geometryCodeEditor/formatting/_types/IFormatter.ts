import {IFormatOptions} from "./IFormatOptions";

export type IFormatter = {
    /**
     * Formats teh contents of this given node, given a current indentation value
     * @param options The options to be used for formatting
     * @param maxLength The maximum number of allowed characters, on the first line, middle lines, and the last line
     * @reutrns The formatted list of lines
     */
    (options: Required<IFormatOptions>, maxLength: [number, number, number]): string[];
};
