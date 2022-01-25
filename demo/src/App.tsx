import {Range, editor as Editor} from "monaco-editor";
import React, {FC, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {useEditor} from "./geometry/editor/geometryCodeEditor/useEditor";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import {GeometryEditorState} from "./geometry/editor/GeometryEditorState";
import {GeometryEditor} from "./geometry/editor/GeometryEditor";
import {Header} from "./Header";
import {Controls} from "./controls/Controls";

const theme = getTheme();
export const App: FC = () => {
    const inputState = useRef<GeometryEditorState>();
    if (!inputState.current) {
        inputState.current = new GeometryEditorState();
        inputState.current.setText(`\
[
    {
        "data": 1,
        "polygon": [
        {"x": 100, "y": 300},
        {"x": 400, "y": 300},
        {"x": 200, "y": 500},
        {
            "x": 287.83241577148436,
            "y": 334.74287719726567
        }
        ]
    },
    {
        "data": 3,
        "polygon": [
        {
            "x": 153.61181804124593,
            "y": 309.9164396245386
        },
        {
            "x": 230.26507669025517,
            "y": 324.0947950541613
        },
        {
            "x": 251.82219024694191,
            "y": 402.49629385320947
        },
        {
            "x": 307.67484687535966,
            "y": 300
        },
        {
            "x": 145.29009687535975,
            "y": 300
        }
        ]
    },
    {
        "data": 4,
        "polygon": [
        {"x": 284.4, "y": 415.6},
        {
            "x": 130.05215457482691,
            "y": 305.5586694746912
        },
        {
            "x": 206.10000000000005,
            "y": 300
        },
        {
            "x": 296.26651060432545,
            "y": 320.9356592398366
        },
        {"x": 310.9, "y": 389.1}
        ]
    },
    {
        "data": 5,
        "polygon": [
        {
            "x": 118.03841899999998,
            "y": 300
        },
        {
            "x": 258.4643325699035,
            "y": 312.1584146448314
        },
        {
            "x": 276.5859288936298,
            "y": 357.0518765872352
        },
        {
            "x": 231.61230688558516,
            "y": 377.96534452638036
        }
        ]
    },
    {
        "data": 6,
        "polygon": [
        {
            "x": 190.6356242736228,
            "y": 306.2856413131559
        },
        {
            "x": 255.18378534462406,
            "y": 328.7039442850717
        },
        {
            "x": 241.73118695130555,
            "y": 365.79612150946724
        },
        {
            "x": 185.0331625188909,
            "y": 345.9900453981884
        }
        ]
    },
    {
        "data": 7,
        "polygon": [
        {
            "x": 160.57225245824662,
            "y": 329.1983046573223
        },
        {
            "x": 173.84913809976695,
            "y": 304.8322268104981
        },
        {
            "x": 239.62009392259236,
            "y": 310.52683496473117
        },
        {
            "x": 248.81482120067398,
            "y": 346.264770815101
        },
        {
            "x": 234.7696828193839,
            "y": 363.36428932367073
        },
        {
            "x": 196.5019692935721,
            "y": 349.9963941582877
        }
        ]
    }
    ]
`);
    }

    const outputState = useRef<GeometryEditorState>();
    if (!outputState.current) {
        outputState.current = new GeometryEditorState();
        outputState.current.setSelectedTool("edit");
    }

    return (
        <Stack style={{height: "100%", background: theme.palette.neutralLight}}>
            <Header />
            <StackItem
                grow
                style={{marginTop: theme.spacing.m, minHeight: 0, flexShrink: 1}}>
                <Stack horizontal style={{height: "100%"}} gap={theme.spacing.m}>
                    <StackItem>
                        <Controls
                            input={inputState.current}
                            output={outputState.current}
                        />
                    </StackItem>
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
