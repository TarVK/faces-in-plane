import {mergeStyles} from "@fluentui/react";
import {IPoint} from "face-combiner";
import {Field, useDataHook} from "model-react";
import React, {FC, useCallback, useState} from "react";
import {useRef} from "react";
import {getDistance} from "../getDistance";
import {EditorPlane} from "./grid/EditorPlane";
import {Polygons} from "./shapes/Polygons";
import {EditorSidebar} from "./sidebar/EditorSidebar";
import {IGeometryEditorProps} from "./_types/IGeometryEditorProps";
import {IInteractionHandler} from "./_types/IInteractionHandler";

export const GeometryEditor: FC<IGeometryEditorProps> = ({
    state,
    width = "100%",
    height = "100%",
}) => {
    const mousePos = useRef<Field<IPoint>>();
    if (!mousePos.current) mousePos.current = new Field({x: 0, y: 0});

    const addPoint = useCallback(
        (point: IPoint) => {
            const {scale} = state.getTransformation();
            const nearPoint = state.findNearestSelectionPoint(point)?.point;
            const dist = nearPoint ? getDistance(nearPoint, point) * scale : Infinity;

            // TODO: make it a non-arbitrary value
            if (dist < 20) state.deselectPolygon();
            else state.addPoint(point);

            console.log(dist < 20);
            console.log(state.getPolygons().map(polygon => polygon.get()));
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

    const onClick = useCallback<IInteractionHandler>(
        (evt, point) => {
            const tool = state.getSelectedTool();
            if (evt.button == 0)
                if (tool == "create") {
                    addPoint(point);
                } else {
                    const selectedPoint = selectPoint(point);
                    if (!selectedPoint) selectPolygon(point);
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
                    const movedPoint = movePoint(point);
                    if (!movedPoint) movePolygon(delta);
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
            }}>
            <EditorSidebar state={state} />
            <EditorPlane
                width={width}
                height={height}
                state={state}
                onMouseDown={onClick}
                onMouseMove={onMouseMove}>
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
