import {Range, editor as Editor} from "monaco-editor";
import React, {FC, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {useEditor} from "./geometry/editor/geometryCodeEditor/useEditor";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import {GeometryEditorState} from "./geometry/editor/GeometryEditorState";
import {GeometryEditor} from "./geometry/editor/GeometryEditor";
import {Header} from "./Header";
import {Controls} from "./controls/Controls";
import {ConvertButton} from "./controls/ConvertButton";
import {Info} from "./Info";

const theme = getTheme();
export const App: FC = () => {
    const inputState = useRef<GeometryEditorState>();
    if (!inputState.current) {
        inputState.current = new GeometryEditorState("input");
    }

    const outputState = useRef<GeometryEditorState>();
    if (!outputState.current) {
        outputState.current = new GeometryEditorState("output");
        outputState.current.setSelectedTool("edit");
    }

    return (
        <Stack style={{height: "100%", background: theme.palette.neutralLight}}>
            <Header info={<Info />}>
                <ConvertButton input={inputState.current} output={outputState.current} />
            </Header>
            <StackItem
                grow
                style={{marginTop: theme.spacing.m, minHeight: 0, flexShrink: 1}}>
                <Stack horizontal style={{height: "100%"}} gap={theme.spacing.m}>
                    {/* <StackItem>
                        <Controls
                            input={inputState.current}
                            output={outputState.current}
                        />
                    </StackItem> */}
                    <StackItem
                        style={{
                            position: "relative",
                            boxShadow: "rgb(0 0 0 / 24%) 0px 0px 9px 3px",
                            flex: 1,
                        }}>
                        <EditorLabel>Input</EditorLabel>
                        <GeometryEditor state={inputState.current} />
                    </StackItem>
                    <StackItem
                        style={{
                            position: "relative",
                            boxShadow: "rgb(0 0 0 / 24%) 0px 0px 9px 3px",
                            zIndex: 1,
                            flex: 1,
                        }}>
                        <EditorLabel>Output</EditorLabel>
                        <GeometryEditor state={outputState.current} readonly />
                    </StackItem>
                </Stack>
            </StackItem>
        </Stack>
    );
};

const EditorLabel: FC = ({children}) => (
    <div
        style={{
            position: "absolute",
            zIndex: 1,
            right: 20,
            top: 50,
            fontSize: 18,
            padding: theme.spacing.s2,
        }}>
        {children}
        <div
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                zIndex: -1,
                bottom: 0,
                background: theme.palette.themeTertiary,
                opacity: 0.4,
            }}></div>
    </div>
);
