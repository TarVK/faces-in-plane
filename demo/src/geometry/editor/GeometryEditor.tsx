import {mergeStyles} from "@fluentui/react";
import {IPoint} from "face-combiner";
import {Field, useDataHook} from "model-react";
import React, {FC, useCallback, useEffect, useState} from "react";
import {useRef} from "react";
import {getDistance} from "../getDistance";
import {EditorPlane} from "./grid/EditorPlane";
import {Polygons} from "./shapes/Polygons";
import {EditorSidebar} from "./sidebar/EditorSidebar";
import {IGeometryEditorProps} from "./_types/IGeometryEditorProps";
import {IInteractionHandler} from "./grid/_types/IInteractionHandler";

export const GeometryEditor: FC<IGeometryEditorProps> = ({
    state,
    width = "100%",
    height = "100%",
}) => {
    const mousePos = useRef<Field<IPoint>>();
    if (!mousePos.current) mousePos.current = new Field({x: 0, y: 0});

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

            const dist = getDistance(closestPoint.point, point);
            if (dist < 20) {
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
    const onClick = useCallback<IInteractionHandler>(
        (evt, point) => {
            didSelectPointOnClick.current = false;
            const tool = state.getSelectedTool();
            if (evt.button == 0)
                if (tool == "create") {
                    addPoint(point);
                } else {
                    const selectedPoint = selectPoint(point);
                    if (!selectedPoint) selectPolygon(point);
                    else didSelectPointOnClick.current = true;
                }
        },
        [state]
    );

    const onMouseMove = useCallback<IInteractionHandler>(
        (evt, point, delta) => {
            mousePos.current?.set(point);
            if (evt.buttons == 1) {
                const tool = state.getSelectedTool();
                if (tool == "edit") {
                    const movedPoint = didSelectPointOnClick.current && movePoint(point);
                    // if (!movedPoint) movePolygon(delta);
                }
            }
        },
        [state]
    );

    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key == "Escape") state.deselectPolygon();
            if (event.key == "Delete" || event.key == "Backspace" || event.key == "d") {
                if (state.getSelectedPoint()) state.deletePoint();
                else state.deletePolygon();
            }
            if (event.key == "t") {
                const tools = ["edit", "create"] as const;
                const index = tools.indexOf(state.getSelectedTool());
                state.setSelectedTool(tools[(index + 1) % tools.length]);
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
            }}>
            <EditorSidebar state={state} />
            <EditorPlane
                width={width}
                height={height}
                state={state}
                onMouseDown={onClick}
                onMouseMove={onMouseMove}
                onKeyDown={onKeyDown}>
                <Polygons state={state} mousePos={mousePos.current} />
            </EditorPlane>
        </div>
    );
};

const style = mergeStyles({
    display: "flex",
    ".plane": {
        flexGrow: 1,
    },
});
