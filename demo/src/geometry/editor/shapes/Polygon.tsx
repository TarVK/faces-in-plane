import {useDataHook} from "model-react";
import React, {FC} from "react";
import {IEditorFace} from "../_types/IEditorFace";
import {IPolygonProps} from "../_types/IPolygonProps";

export const Polygon: FC<IPolygonProps> = ({polygon, state}) => {
    const [h] = useDataHook();
    const face = polygon.get(h);
    return <PolygonInner face={face} state={state} />;
};

export const PolygonInner: FC<Omit<IPolygonProps, "polygon"> & {face: IEditorFace}> = ({
    face,
    opacity,
    children,
    points,
    state,
}) => {
    const [h] = useDataHook();
    const {scale} = state.getTransformation(h);
    const {
        polygonEdgeSize,
        polygonPointSize,
        polygonColor,
        polygonEdgeColor,
        polygonPointColor,
        polygonEdgeOpacity,
        polygonOpacity,
        polygonPointOpacity,
    } = state.getConfig(h);

    const path = face.polygon.map(({x, y}) => `${x},${-y}`).join(" ");
    const lineWidth = (face.edgeSize ?? polygonEdgeSize) / scale;
    const pointSize = (face.pointSize ?? polygonPointSize) / scale;
    return (
        <g>
            <polygon
                points={path}
                fill={face.color ?? polygonColor}
                stroke={face.edgeColor ?? polygonEdgeColor}
                fillOpacity={opacity ?? face.opacity ?? polygonOpacity}
                strokeOpacity={face.edgeOpacity ?? polygonEdgeOpacity}
                strokeWidth={lineWidth}
            />
            {pointSize > 0 &&
                (points ?? face.polygon).map(({x, y}, i) => (
                    <circle
                        key={i}
                        cx={x}
                        cy={-y}
                        r={pointSize}
                        fillOpacity={face.pointOpacity ?? polygonPointOpacity}
                        fill={face.pointColor ?? polygonPointColor}
                    />
                ))}
            {children}
        </g>
    );
};
