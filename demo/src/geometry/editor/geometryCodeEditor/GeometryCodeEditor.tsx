import {FC} from "react";
import {useEditor} from "../../../useEditor";
import {GeometryEditorState} from "../GeometryEditorState";

export const GeometryCodeEditor: FC<{state: GeometryEditorState}> = () => {
    const [el, ref] = useEditor({
        value: "hoi",
        style: {
            height: "100%",
            flex: 1,
            zIndex: 2,
        },
        options: {
            language: "json",
        },
    });
    return el;
};
