import {Range, editor as Editor} from "monaco-editor";
import React, {FC, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {useEditor} from "./useEditor";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import {Header} from "./Header";
import {Sidebar} from "./Sidebar";
import {ISATSolver, parse} from "SAT";
import {ISolveResult} from "./_types/ISolveResult";
import {combineOptions} from "./util/combineOptions";
import {getResultVariables} from "./util/getResultVariables";
import {useAnnotationRemover} from "./util/useAnnotationsRemover";
import {ExampleModal} from "./examples/ExampleModal";

const theme = getTheme();
export const App: FC = () => {
    const [editor, editorRef] = useEditor({
        value: "(!a || a) => ((a <=> b) && (b <=> c))",
        height: "100%",
        options: {
            minimap: {enabled: false},
            scrollbar: {useShadows: false},
            scrollBeyondLastLine: false,
        },
    });
    const [result, setResult] = useState<ISolveResult>();

    const solve = useCallback(
        (solver: ISATSolver) => {
            const start = Date.now();
            const getTime = () => Date.now() - start;
            const result = parse(editorRef.current!.getValue());
            if (result.status) {
                const formula = result.value;
                formula.solve(solver).then(solution => {
                    if (solution)
                        setResult({
                            satisfiable: true,
                            solution: getResultVariables(formula, solution),
                            duration: getTime(),
                        });
                    else setResult({satisfiable: false, duration: getTime()});
                });
            } else {
                setResult({
                    error: {
                        ...result,
                        message: `Syntax error, expected ${combineOptions(
                            result.expected
                        )}`,
                    },
                    duration: getTime(),
                });
            }
        },
        [editorRef.current]
    );

    useEffect(() => {
        const editor = editorRef.current;

        // Resize the editor on changes (sidebar may have changed size)
        if (editor) editor.layout();

        // Highlight syntax errors in the editor
        if (result && "error" in result && editor) {
            const index = result.error.index;
            const text = editor.getValue();
            const range = new Range(
                index.line,
                index.column,
                index.line,
                index.column + 1
            );
            const decorations = editor.deltaDecorations(
                [],
                [
                    {
                        range,
                        options: {
                            // Fixes the issue of there not being a character to highlight at the end of a line
                            before:
                                index.offset == text.length
                                    ? {inlineClassName: "error", content: " "}
                                    : undefined,
                            marginClassName: "errorMargin",
                            inlineClassName: "error",
                            overviewRuler: {
                                color: "rgb(179, 82, 82)",
                                position: Editor.OverviewRulerLane.Left,
                            },
                            hoverMessage: {value: result.error.message},
                        },
                    },
                    {
                        range,
                        options: {
                            className: "errorLine",
                            isWholeLine: true,
                        },
                    },
                ]
            );
            return () => void editor.deltaDecorations(decorations, []);
        }
    }, [result]);

    // Remove any annotation when the user changes the related line
    useAnnotationRemover(editorRef.current);

    return (
        <div>
            <Stack styles={{root: {height: "100%", overflow: "hidden"}}}>
                <StackItem>
                    <Header>
                        <ExampleModal
                            onLoad={value => {
                                editorRef.current?.setValue(value);
                            }}
                        />
                    </Header>
                </StackItem>
                <StackItem grow={1} style={{minHeight: 0}}>
                    <Stack horizontal styles={{root: {height: "100%"}}}>
                        <StackItem
                            align="stretch"
                            grow={1}
                            shrink={1}
                            styles={{root: {flexBasis: 0, minWidth: 0}}}>
                            {editor}
                        </StackItem>
                        <StackItem
                            style={{
                                minWidth: 200,
                                boxShadow: theme.effects.elevation8,
                                paddingLeft: theme.spacing.s1,
                                paddingRight: theme.spacing.s1,
                                zIndex: 100,
                            }}>
                            <Sidebar onSolve={solve} result={result} />
                        </StackItem>
                    </Stack>
                </StackItem>
            </Stack>
        </div>
    );
};
