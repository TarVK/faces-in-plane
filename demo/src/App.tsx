import {Range, editor as Editor} from "monaco-editor";
import React, {FC, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {useEditor} from "./useEditor";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import {GeometryEditorState} from "./geometry/editor/GeometryEditorState";
import {GeometryEditor} from "./geometry/editor/GeometryEditor";

const theme = getTheme();
export const App: FC = () => {
    const editorState = useRef<GeometryEditorState>();
    if (!editorState.current) editorState.current = new GeometryEditorState();

    return <GeometryEditor state={editorState.current} />;
};
