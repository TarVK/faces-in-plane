import {IPoint} from "face-combiner";
import {useDataHook} from "model-react";
import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import {Polygon} from "./Polygon";
import {SelectedPolygon} from "./SelectedPolygon";
import {IPolygonsProps} from "../_types/IPolygonsProps";
import {useWindowSize} from "../../../util/useWindowSize";

export const Polygons: FC<IPolygonsProps> = ({state, mousePos, readonly}) => {
    const [h] = useDataHook();
    const [size, setSize] = useState<IPoint>({x: 0, y: 0});
    const containerRef = useRef<SVGElement>();

    const setContainer = useCallback((container: SVGElement | null) => {
        if (container) {
            const rect = container.getBoundingClientRect();
            setSize({x: rect.width, y: rect.height});
            containerRef.current = container;
        }
    }, []);

    const editorShown = state.isCodeEditorVisible(h);
    const windowSize = useWindowSize();
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const update = () => {
            const rect = container.getBoundingClientRect();
            setSize({x: rect.width, y: rect.height});
        };
        update();
        setTimeout(update); // Requires rerender first
    }, [windowSize, editorShown]);

    const {scale, offset} = state.getTransformation(h);
    return (
        <svg
            style={{position: "absolute"}}
            width="100%"
            height="100%"
            ref={setContainer}
            viewBox={`${-offset.x / scale - size.x / scale / 2} ${
                offset.y / scale - size.y / scale / 2
            } ${size.x / scale} ${size.y / scale}`}>
            {state.getNonSelectedPolygons(h).map((polygon, i) => (
                <Polygon key={i} polygon={polygon} state={state} />
            ))}
            <SelectedPolygon mousePos={mousePos} state={state} readonly={readonly} />
        </svg>
    );
};
