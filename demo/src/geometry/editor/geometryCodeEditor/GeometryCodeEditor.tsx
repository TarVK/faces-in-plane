import {useDataHook} from "model-react";
import React, {FC, useEffect, useRef, useState} from "react";
import {useEditor} from "./useEditor";
import {GeometryEditorState} from "../GeometryEditorState";
import {editor as Editor} from "monaco-editor/esm/vs/editor/editor.api";
import {MessageBar, MessageBarButton, MessageBarType} from "@fluentui/react";

export const GeometryCodeEditor: FC<{
    state: GeometryEditorState;
    editorRef: React.MutableRefObject<Editor.IStandaloneCodeEditor | undefined>;
    readonly?: boolean;
}> = ({state, editorRef, readonly}) => {
    const [h] = useDataHook();
    const [hasError, setHasError] = useState(false);
    const text = state.getText(h);
    const undoVersion = state.getUndoVersion(h);
    const [el, codeRef] = useEditor({
        value: "[]",
        style: {
            height: "100%",
            flex: 1,
            zIndex: 2,
        },
        options: {
            language: "json",
        },
    });
    editorRef.current = codeRef.current;
    useEffect(() => {
        const editor = codeRef.current;
        if (editor) editor.updateOptions({readOnly: readonly});
    }, [readonly, editorRef.current]);

    const versionRef = useRef(0);
    const [syncId, setSyncId] = useState(0);
    useEffect(() => {
        const editor = codeRef.current;
        const model = editor?.getModel();
        if (editor && model) {
            const current = editor.getValue();
            if (current.trim() == text.trim()) return;

            if (readonly) {
                editor.setValue(text);
            } else {
                // https://stackoverflow.com/a/66250288/8521718
                const fullRange = model.getFullModelRange();
                versionRef.current++;
                editor.executeEdits("graphical", [
                    {
                        text,
                        range: fullRange,
                    },
                ]);
            }

            if (hasError) setHasError(false);
        }
    }, [text, codeRef.current, syncId, readonly]);

    useEffect(() => {
        const editor = codeRef.current;
        const model = editor?.getModel();
        if (editor && model) {
            const disposer = model.onDidChangeContent(event => {
                if (versionRef.current != event.versionId)
                    setHasError(!state.setText(model.getValue()));
                versionRef.current = event.versionId;
            });

            versionRef.current = model.getVersionId();

            return () => disposer.dispose();
        }
    }, [state, codeRef.current]);

    useEffect(() => {
        const editor = codeRef.current;
        if (editor) editor.pushUndoStop();
    }, [undoVersion]);

    const shown = state.isCodeEditorVisible(h);
    useEffect(() => {
        const editor = codeRef.current;
        if (editor) editor.layout();
    }, [shown]);

    return (
        <div
            style={{
                flex: shown ? 1 : 0,
                minWidth: 0,
                width: shown ? "auto" : 0,
                display: "flex",
                flexDirection: "column",
            }}>
            {el}

            {hasError && (
                <MessageBar
                    dismissButtonAriaLabel="Close"
                    messageBarType={MessageBarType.warning}
                    actions={
                        <div>
                            <MessageBarButton onClick={() => setSyncId(id => id + 1)}>
                                Yes
                            </MessageBarButton>
                        </div>
                    }>
                    The current state of this code contains errors, do you want to reload
                    it?
                </MessageBar>
            )}
        </div>
    );
};