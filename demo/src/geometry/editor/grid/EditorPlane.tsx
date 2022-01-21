import {IPoint} from "face-combiner";
import {useDataHook} from "model-react";
import React, {FC, useCallback, useEffect, useState} from "react";
import {useRef} from "react";
import {XAxis, YAxis} from "./Axes";
import {Grid} from "./Grid";
import {IEditorPlaneProps} from "./_types/IEditorPlaneProps";

export const EditorPlane: FC<IEditorPlaneProps> = ({
    children,
    state,
    width = "100%",
    height = "100%",
    onMouseDown: onMouseDownHandler,
    onMouseUp: onMouseUpHandler,
    onMouseMove: onMouseMoveHandler,
    onKeyDown: onKeyDownHandler,
    onKeyUp: onKeyUpHandler,
}) => {
    const [h] = useDataHook();
    const [size, setSize] = useState<{x: number; y: number}>({x: 0, y: 0});
    const containerRef = useRef<HTMLDivElement>();

    const getWorldPoint = useCallback((point: IPoint, el: HTMLDivElement) => {
        const {offset, scale} = state.getTransformation();
        const elBox = el.getBoundingClientRect();
        const screenspacePoint = {
            x: point.x - elBox.x - elBox.width / 2,
            y: elBox.height - (point.y - elBox.y) - elBox.height / 2,
        };
        return {
            x: (screenspacePoint.x - offset.x) / scale,
            y: (screenspacePoint.y - offset.y) / scale,
            inPlane:
                elBox.x <= point.x &&
                elBox.y <= point.y &&
                elBox.x + elBox.width >= point.x &&
                elBox.y + elBox.height >= point.y,
        };
    }, []);
    const getEventData = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        const {scale} = state.getTransformation();
        const delta = {
            x: evt.movementX / scale,
            y: -evt.movementY / scale,
        };
        const el = containerRef.current;
        if (!el)
            return {
                worldPoint: {x: evt.clientX, y: evt.clientY},
                worldDelta: delta,
            };

        const worldspacePoint = getWorldPoint({x: evt.clientX, y: evt.clientY}, el);

        return {
            worldPoint: worldspacePoint,
            worldDelta: delta,
        };
    }, []);

    const setContainer = useCallback((container: HTMLDivElement | null) => {
        if (container) {
            const rect = container.getBoundingClientRect();
            setSize({x: rect.width, y: rect.height});
            containerRef.current = container;

            // Move the plane to foxus on the top right quadrant
            const {scale} = state.getTransformation();
            state.setTransformation({
                offset: {
                    x: (-rect.width / 2) * 0.8,
                    y: (-rect.height / 2) * 0.8,
                },
                scale: scale,
            });
        }
    }, []);
    const onMouseDrag = useCallback(
        (evt: React.MouseEvent<HTMLDivElement>) => {
            if (evt.buttons == 2) state.translate(evt.movementX, -evt.movementY);
            if (onMouseMoveHandler) {
                const {worldDelta, worldPoint} = getEventData(evt);
                onMouseMoveHandler(evt, worldPoint, worldDelta);
            }
        },
        [onMouseMoveHandler]
    );
    const onContextMenu = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
        evt.preventDefault();
    }, []);
    const onMouseDown = useCallback(
        (evt: React.MouseEvent<HTMLDivElement>) => {
            if (onMouseDownHandler) {
                const {worldDelta, worldPoint} = getEventData(evt);
                onMouseDownHandler(evt, worldPoint, worldDelta);
            }
        },
        [onMouseDownHandler]
    );
    const onMouseUp = useCallback(
        (evt: React.MouseEvent<HTMLDivElement>) => {
            if (onMouseUpHandler) {
                const {worldDelta, worldPoint} = getEventData(evt);
                onMouseUpHandler(evt, worldPoint, worldDelta);
            }
        },
        [onMouseUpHandler]
    );

    const onWheel = useCallback((evt: React.WheelEvent<HTMLDivElement>) => {
        // TODO: also handle pinch events: https://stackoverflow.com/a/11183333/8521718
        const dir = evt.deltaY < 0 ? -1 : evt.deltaY > 0 ? 1 : 0;
        if (dir != 0) {
            const el = containerRef.current;
            if (!el) return;
            const elBox = el.getBoundingClientRect();

            const pos = {
                x: evt.clientX - elBox.x - elBox.width / 2,
                y: elBox.height - (evt.clientY - elBox.y) - elBox.height / 2,
            };

            const zoomSpeed = 1 - state.getConfig().zoomSpeed;
            const oldScale = state.getTransformation().scale;
            const newScale = dir > 0 ? oldScale / zoomSpeed : oldScale * zoomSpeed;

            state.scaleAt(newScale, pos);
        }
    }, []);

    useEffect(() => {
        const getMouseData = () => {
            if (!containerRef.current) return;
            const worldPoint = getWorldPoint(mousePosition, containerRef.current);
            if (!worldPoint.inPlane) return;
            return worldPoint;
        };
        const downHandler = (event: KeyboardEvent) => {
            const mousePoint = getMouseData();
            if (mousePoint) onKeyDownHandler?.(event, mousePoint);
        };
        const upHandler = (event: KeyboardEvent) => {
            const mousePoint = getMouseData();
            if (mousePoint) onKeyUpHandler?.(event, mousePoint);
        };

        let mousePosition = {x: 0, y: 0};
        const mouseHandler = (mouseMoveEvent: MouseEvent) => {
            mousePosition.x = mouseMoveEvent.pageX;
            mousePosition.y = mouseMoveEvent.pageY;
        };

        if (onKeyDownHandler || onKeyUpHandler)
            window.addEventListener("mousemove", mouseHandler);
        if (onKeyDownHandler) window.addEventListener("keydown", downHandler);
        if (onKeyUpHandler) window.addEventListener("keyup", upHandler);
        return () => {
            window.removeEventListener("mousemove", mouseHandler);
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, [onKeyDownHandler, onKeyUpHandler]);

    const {offset, scale} = state.getTransformation(h);
    const gridSize = state.getGridSize(h);
    const {showAxis, grid} = state.getConfig(h);
    return (
        <div
            className="plane"
            ref={setContainer}
            style={{
                width,
                height,
                overflow: "hidden",
                position: "relative",
            }}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseDrag}
            onWheel={onWheel}
            onContextMenu={onContextMenu}>
            {size.x != 0 && (
                <>
                    <Grid offset={offset} scale={scale} gridSize={gridSize} type={grid} />
                    {showAxis && (
                        <XAxis
                            containerSize={size}
                            offset={offset}
                            scale={scale}
                            spacing={gridSize}
                        />
                    )}
                    {showAxis && (
                        <YAxis
                            containerSize={size}
                            offset={offset}
                            scale={scale}
                            spacing={gridSize}
                        />
                    )}
                </>
            )}
            {children}
        </div>
    );
};
