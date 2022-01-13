import {editor} from "monaco-editor";
import {useEffect} from "react";

export function useAnnotationRemover(editor?: editor.IStandaloneCodeEditor): void {
    useEffect(() => {
        if (editor) {
            const disposable = editor.onDidChangeModelContent(event => {
                event.changes.map(change => {
                    for (
                        let i = change.range.startLineNumber;
                        i <= change.range.endLineNumber;
                        i++
                    ) {
                        const decorations = editor.getLineDecorations(i);
                        if (decorations)
                            editor.deltaDecorations(
                                decorations.map(dec => dec.id),
                                []
                            );
                    }
                });
            });
            return () => disposable.dispose();
        }
    }, [editor]);
}
