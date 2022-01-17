import {Range, editor as Editor} from "monaco-editor";
import React, {FC, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {useEditor} from "./useEditor";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import {GeometryEditorState} from "./geometry/editor/GeometryEditorState";
import {GeometryEditor} from "./geometry/editor/GeometryEditor";

const theme = getTheme();
export const App: FC = () => {
    const editorState = useRef<GeometryEditorState>();
    if (!editorState.current) {
        editorState.current = new GeometryEditorState();
        editorState.current.setPolygons([
            {
                data: "1",
                polygon: [
                    {x: 1, y: 1},
                    {x: 2, y: 2},
                    {x: 1.5, y: 3},
                    {x: 3, y: 4},
                    {x: 5, y: 7},
                    {x: 12, y: 7},
                    {x: 16, y: 5},
                    {x: 15.009575843811, y: 2.52393960952759},
                    {x: 15, y: 2.5},
                    {x: 14, y: 1.7},
                    {x: 9.67873620209226, y: 1.42992101263077},
                    {x: 9.67873573303223, y: 1.42992055416107},
                    {x: 6, y: 1.2},
                    {x: 5.12431324239551, y: 1.16497252969582},
                    {x: 4.75944375991821, y: 1.15037763118744},
                    {x: 4.75944384237432, y: 1.15037775369497},
                    {x: 1, y: 1},
                    {x: 17, y: 0},
                    {x: 17, y: 8},
                    {x: 0, y: 8},
                    {x: 0, y: 0},
                    {x: 17, y: 0},
                ].map(({x, y}) => ({x: x * 100, y: y * 100})),
            },
        ]);
    }

    return <GeometryEditor state={editorState.current} />;
};
