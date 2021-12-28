import {Application} from "@pixi/app";
import React, {FC, useCallback, useEffect, useRef} from "react";
import {IGameSettings} from "../data/_types/IGameSettings";
import {IGameState} from "../data/_types/IGameState";
import {useBodySize} from "../utils/useBodySize";
import {GameGraphicsContainer} from "./GameGraphicsContainer";
/**
 * The react graphics component to visualize the game
 */
export const Graphics: FC<{state: IGameState; settings: IGameSettings}> = ({
    state,
    settings,
}) => {
    const sizeRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const applicationRef = useRef<{app: Application; container: GameGraphicsContainer}>();

    const getSize = useCallback(() => {
        const el = sizeRef.current;
        if (el) {
            const box = el.getBoundingClientRect();
            const ratio = settings.height / settings.width;
            const heightIsBottleNeck = box.width * ratio > box.height;
            const width = heightIsBottleNeck ? box.height / ratio : box.width;
            const height = heightIsBottleNeck ? box.height : box.width * ratio;
            return {width, height};
        }
        return {width: 0, height: 0};
    }, [settings.width, settings.height, sizeRef.current]);

    useEffect(() => {
        const el = containerRef.current;
        if (el) {
            const {width, height} = getSize();

            // Create the application and add its render target to the page
            const app = new Application({
                width: width,
                height: height,
                antialias: true,
            });
            el.appendChild(app.view);

            const container = new GameGraphicsContainer(state, settings);
            app.stage.addChild(container);
            // testDecomposition(app.stage);

            // Invert the y-axis, such that 0,0 is the bottom left instead of top left
            app.stage.scale.y = -1;
            app.stage.y = height;

            applicationRef.current = {app, container};
            return () => {
                app.view.remove();
                app.destroy();
            };
        }
    }, [sizeRef.current, state]);
    const {width, height} = useBodySize();
    useEffect(() => {
        if (!applicationRef.current) return;
        const {app, container} = applicationRef.current;
        if (sizeRef.current && app) {
            const {width, height} = getSize();
            app.renderer.resize(width, height);
            app.stage.y = height;
        }
    }, [width, height]);

    return (
        <div
            ref={sizeRef}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
            <div ref={containerRef}></div>
        </div>
    );
};
