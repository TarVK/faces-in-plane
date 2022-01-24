import {getTheme, mergeStyles} from "@fluentui/react";
import {IPoint} from "face-combiner";
import {Field, useDataHook} from "model-react";
import React, {FC, useCallback} from "react";
import {useRef} from "react";
import {getDistance} from "../getDistance";
import {EditorPlane} from "./grid/EditorPlane";
import {Polygons} from "./shapes/Polygons";
import {EditorToolbar} from "./toolbar/EditorToolbar";
import {IGeometryEditorProps} from "./_types/IGeometryEditorProps";
import {IInteractionHandler} from "./grid/_types/IInteractionHandler";
import {GeometryCodeEditor} from "./geometryCodeEditor/GeometryCodeEditor";
import {editor as Editor} from "monaco-editor/esm/vs/editor/editor.api";

export const GeometryEditor: FC<IGeometryEditorProps> = ({
    state,
    readonly,
    width = "100%",
    height = "100%",
}) => {
    const mousePos = useRef<Field<IPoint | null>>();
    if (!mousePos.current) mousePos.current = new Field(null);
    const editorRef = useRef<Editor.IStandaloneCodeEditor>();

    const addPoint = useCallback(
        (point: IPoint) => {
            const targetPoint = state.snap(point);

            const polygon = state.getSelectedPolygon()?.polygon;
            if (polygon != undefined) {
                const index = state.getSelectedPointIndex() ?? polygon.length - 1;
                const nextPoint = polygon[(index + 1) % polygon.length];
                const dist = getDistance(targetPoint, nextPoint);

                if (dist == 0) {
                    state.deselectPolygon();
                    return;
                }
            }

            state.addPoint(targetPoint);
        },
        [state]
    );
    const selectPolygon = useCallback(
        (point: IPoint) => {
            const selected = state.getSelectedPolygon();
            const newSelected = state.findIntersectingPolygon(point, selected);
            if (newSelected) state.selectPolygon(newSelected);
            else state.deselectPolygon();
        },
        [state]
    );
    const selectPoint = useCallback(
        (point: IPoint) => {
            const currentIndex = state.getSelectedPointIndex();
            const closestPoint = state.findNearestSelectionPoint(point, currentIndex);
            if (!closestPoint) return false;

            const {scale} = state.getTransformation();
            const {selectPointDistance} = state.getConfig();

            const dist = getDistance(closestPoint.point, point);
            if (dist < selectPointDistance / scale) {
                state.selectPolygonPoint(closestPoint.index);
                return true;
            }
            return false;
        },
        [state]
    );
    const movePoint = useCallback(
        (point: IPoint) => {
            const currentIndex = state.getSelectedPointIndex();
            if (currentIndex == undefined) return false;

            state.movePoint(point);
            return true;
        },
        [state]
    );
    const movePolygon = useCallback(
        (delta: IPoint) => {
            state.movePolygon(delta);
        },
        [state]
    );

    const didSelectPointOnClick = useRef(false);
    const didMovePoint = useRef(false);
    const onClick = useCallback<IInteractionHandler>(
        (evt, point) => {
            didSelectPointOnClick.current = false;
            didMovePoint.current = false;
            const tool = state.getSelectedTool();
            if (evt.button == 0)
                if (tool == "create") {
                    if (!readonly) {
                        addPoint(point);
                        state.addUndo();
                    }
                } else {
                    const selectedPoint = selectPoint(point);
                    if (!selectedPoint) selectPolygon(point);
                    else didSelectPointOnClick.current = true;
                }
        },
        [state, readonly]
    );

    const onMouseUp = useCallback<IInteractionHandler>(
        (evt, point) => {
            if (didMovePoint.current) {
                state.addUndo();
            }
        },
        [state]
    );

    const onMouseMove = useCallback<IInteractionHandler>(
        (evt, point, delta) => {
            mousePos.current?.set(point);
            if (evt.buttons == 1) {
                const tool = state.getSelectedTool();
                if (tool == "edit" && !readonly) {
                    const movedPoint = didSelectPointOnClick.current && movePoint(point);
                    if (movedPoint) {
                        didMovePoint.current = true;
                    }
                    // if (!movedPoint) movePolygon(delta);
                }
            }
        },
        [state]
    );

    const onMouseLeave = useCallback(() => {
        mousePos.current?.set(null);
    }, [state]);

    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key == "Escape") state.deselectPolygon();
            if (!readonly) {
                if (
                    event.key == "Delete" ||
                    event.key == "Backspace" ||
                    event.key == "d"
                ) {
                    if (state.getSelectedPoint()) state.deletePoint();
                    else state.deletePolygon();
                    state.addUndo();
                }
            }
            if (event.key == "t") {
                const tools = ["edit", "create"] as const;
                const index = tools.indexOf(state.getSelectedTool());
                state.setSelectedTool(tools[(index + 1) % tools.length]);
            }

            if (!readonly) {
                const editor = editorRef.current;
                if (editor) {
                    if (event.key == "z" && event.ctrlKey) {
                        editor.trigger("graphical", "undo", undefined);
                    }
                    if (event.key == "y" && event.ctrlKey) {
                        editor.trigger("graphical", "redo", undefined);
                    }
                }
            }
        },
        [state]
    );

    return (
        <div
            className={style}
            style={{
                width,
                height,
                background: "white",
            }}>
            <EditorToolbar state={state} readonly={readonly} />
            <div className="content">
                <GeometryCodeEditor
                    state={state}
                    editorRef={editorRef}
                    readonly={readonly}
                />
                <EditorPlane
                    width={"auto"}
                    height={height}
                    state={state}
                    onMouseDown={onClick}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onKeyDown={onKeyDown}
                    onMouseLeave={onMouseLeave}>
                    <Polygons
                        state={state}
                        mousePos={mousePos.current}
                        readonly={readonly}
                    />
                </EditorPlane>
            </div>
        </div>
    );
};

const style = mergeStyles({
    display: "flex",
    flexDirection: "column",
    ".plane": {
        flexGrow: 1,
    },
    ".content": {
        display: "flex",
        flex: 1,
        minHeight: 0,
    },
    ".codeEditor": {
        boxShadow: "rgb(0 0 0 / 25%) 3px 0px 10px 0px",
        // Cut off the box shadow at the top
        clipPath: "polygon(0 0, 0px 10000px, 10000px 10000px, 10000px 0px)",
    },
    ".toolbar": {
        boxShadow: "rgb(0 0 0 / 25%) 0px 3px 10px 0px",
    },
});
