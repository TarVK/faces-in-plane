import {mergeStyles} from "@fluentui/react";
import {useDataHook} from "model-react";
import React, {FC, useCallback, useState} from "react";
import {useRef} from "react";
import {XAxis, YAxis} from "./Axes";
import {Grid} from "./Grid";
import {IGeometryEditorProps} from "./_types/IGeometryEditorProps";

export const GeometryEditor: FC<IGeometryEditorProps> = ({
    state,
    width = "100%",
    height = "100%",
}) => {
    const [h] = useDataHook();
    const [size, setSize] = useState<{x: number; y: number}>({x: 0, y: 0});

    const setContainer = useCallback((container: HTMLDivElement | null) => {
        if (container) {
            const rect = container.getBoundingClientRect();
            setSize({x: rect.width, y: rect.height});
        }
    }, []);
    const onMouseDrag = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        if (evt.buttons == 2) state.translate(evt.movementX, -evt.movementY);
    }, []);
    const onContextMenu = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        evt.preventDefault();
    }, []);
    const onMouseDown = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {}, []);

    const onWheel = useCallback((evt: React.WheelEvent<HTMLDivElement>) => {
        // TODO: also handle pinch events: https://stackoverflow.com/a/11183333/8521718
        const dir = evt.deltaY < 0 ? -1 : evt.deltaY > 0 ? 1 : 0;
        if (dir != 0) {
            const el = evt.target as HTMLDivElement;
            const elBox = el.getBoundingClientRect();

            const pos = {
                x: evt.clientX - elBox.x - elBox.width / 2,
                y: elBox.height - (evt.clientY - elBox.y) - elBox.height / 2,
            };

            const zoomSpeed = 0.9; // TODO: make adjustable
            const oldScale = state.getTransformation().scale;
            const newScale = dir > 0 ? oldScale / zoomSpeed : oldScale * zoomSpeed;

            state.scaleAt(newScale, pos);
        }
    }, []);

    const {offset, scale} = state.getTransformation(h);
    const gridSize = state.getGridSize(h);
    return (
        <div
            ref={setContainer}
            className={styles}
            style={{
                width,
                height,
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseDrag}
            onWheel={onWheel}
            onContextMenu={onContextMenu}>
            {size.x != 0 && (
                <>
                    <Grid offset={offset} scale={scale} gridSize={gridSize} />
                    <XAxis
                        containerSize={size}
                        offset={offset}
                        scale={scale}
                        spacing={gridSize}
                    />
                    <YAxis
                        containerSize={size}
                        offset={offset}
                        scale={scale}
                        spacing={gridSize}
                    />
                </>
            )}
        </div>
    );
};

const styles = mergeStyles({
    overflow: "hidden",
    position: "relative",
});
