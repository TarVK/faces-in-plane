import {IPoint} from "face-combiner";
import {useDataHook} from "model-react";
import React, {FC} from "react";
import {Polygon, PolygonInner} from "./Polygon";
import {IEditorFace} from "../_types/IEditorFace";
import {ISelectedPolygonProps} from "../_types/ISelectedPolygonProps";

export const SelectedPolygon: FC<ISelectedPolygonProps> = ({state, mousePos}) => {
    const [h] = useDataHook();
    const face = state.getSelectedPolygon(h);
    if (!face) return <></>;

    const {
        polygonSelectOpacity,
        polygonPointSelectOpacity,
        polygonPointSelectSize,
        polygonPointColor,
    } = state.getConfig(h);
    const {scale} = state.getTransformation(h);

    let newFace: IEditorFace;
    if (state.getSelectedTool(h) == "create") {
        const selectedPointIndex =
            state.getSelectedPointIndex(h) ?? face.polygon.length - 1;

        const newPoints = [
            ...face.polygon.slice(0, selectedPointIndex + 1),
            mousePos.get(h),
            ...face.polygon.slice(selectedPointIndex + 1),
        ];
        newFace = {...face, polygon: newPoints};
    } else {
        newFace = face;
    }

    const selectedIndex = state.getSelectedPointIndex(h);
    const selectedPoint = state.getSelectedPoint(h);
    let points: IPoint[] | undefined;
    let extraPoint: JSX.Element | undefined;
    if (selectedIndex != undefined && selectedPoint) {
        points = [
            ...newFace.polygon.slice(0, selectedIndex),
            ...newFace.polygon.slice(selectedIndex + 1),
        ];
        extraPoint = (
            <circle
                cx={selectedPoint.x}
                cy={-selectedPoint.y}
                r={polygonPointSelectSize / scale}
                fillOpacity={polygonPointSelectOpacity}
                fill={face.color ?? polygonPointColor}
            />
        );
    }

    return (
        <PolygonInner
            face={newFace}
            points={points}
            state={state}
            opacity={polygonSelectOpacity}>
            {extraPoint}
        </PolygonInner>
    );
};