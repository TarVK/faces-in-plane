import {GeometryEditorState} from "../GeometryEditorState";
import {IEditorFace} from "../_types/IEditorFace";
import {Position} from "monaco-editor/esm/vs/editor/editor.api";
import {jsonEquals} from "./jsonEquals";

/**
 * Finds the face that the the text cursor is currently at
 * @param text The polygon text to look through
 * @param position The cursor position
 * @param state The geometry editor state
 * @returns The corresponding polygon
 */
export function findPolygonFromText(
    text: string,
    position: Position,
    state: GeometryEditorState
): null | IEditorFace {
    // Retrieve the 1d index
    const lines = text.split("\n");
    let index = position.column - 1;
    for (let i = 0; i < position.lineNumber - 1; i++) {
        index += lines[i].length + 1; // +1 for \n
    }

    // Collect nested object ranges
    const ranges: {start: number; end: number}[] = [];
    let range: {start: number; end: number} = {start: index - 1, end: index};
    while (range.start >= 0 && range.end < text.length) {
        let lBalance = 0;
        while (range.start > 0) {
            const char = text[range.start];
            if (char == "{" || char == "[") lBalance--;
            if (char == "}" || char == "]") lBalance++;
            if (lBalance < 0) break;
            range.start--;
        }
        let rBalance = 0;
        while (range.end < text.length) {
            const char = text[range.end];
            if (char == "{" || char == "[") rBalance++;
            if (char == "}" || char == "]") rBalance--;
            if (rBalance < 0) break;
            range.end++;
        }
        if (range.start >= 0 && range.end < text.length) ranges.unshift({...range});

        range.start--;
        range.end++;
    }

    // Get thepolygon associated to the range
    try {
        const polygonRange = ranges[1];
        const textRange = text.substring(polygonRange.start, polygonRange.end + 1);
        const inpPolygon = JSON.parse(textRange);
        return (
            state
                .getPolygons()
                .find(polygonField => {
                    const polygon = polygonField.get();
                    return jsonEquals(polygon, inpPolygon);
                })
                ?.get() ?? null
        );
    } catch (e) {
        return null;
    }
}
