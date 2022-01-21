import {loader, useMonaco} from "@monaco-editor/react";
import {languages, editor, Uri} from "monaco-editor/esm/vs/editor/editor.api";
import React, {FC, useRef, useEffect, useState, CSSProperties} from "react";
import {polygonSchema} from "./geometry/editor/geometryCodeEditor/polygonSchema";

/**
 * Returns an editor element, and the editor that was created
 * @param config The configuration for the editor
 * @returns The element and editor ref
 */
export const useEditor = ({
    value,
    style,
    options,
}: {
    value: string;
    style: CSSProperties;
    options: editor.IStandaloneEditorConstructionOptions;
}) => {
    const monaco = useMonaco();
    const elementRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor>();

    useEffect(() => {
        if (elementRef.current && monaco) {
            const modelUri = monaco.Uri.parse(
                `a://${Math.round(Math.random() * 1e6)}.json`
            ); // a made up unique URI for our model
            const e = (editorRef.current = monaco.editor.create(elementRef.current, {
                value: value,
                language: "JSON",
                folding: true,
                minimap: {enabled: false},
                foldingStrategy: "auto",
                ...options,
                model: monaco.editor.createModel(value, "json", modelUri),
            }));
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                schemas: [
                    {
                        uri: "http://myserver/foo-schema.json",
                        fileMatch: [modelUri.toString()],
                        schema: polygonSchema,
                    },
                ],
            });

            const resizeListener = () => e.layout();
            window.addEventListener("resize", resizeListener);

            return () => {
                e.dispose();
                window.removeEventListener("resize", resizeListener);
            };
        }
    }, [monaco]);

    return [
        <section
            style={{
                display: "flex",
                position: "relative",
                textAlign: "initial",
                overflow: "hidden",
                ...style,
            }}>
            {monaco ? <div ref={elementRef} style={{width: "100%"}} /> : "Loading..."}
        </section>,
        editorRef,
    ] as const;
};
