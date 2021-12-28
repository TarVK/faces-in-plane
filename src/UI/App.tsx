import {Field} from "model-react";
import React, {FC, useEffect, useMemo} from "react";
import {startGameLoop} from "../controller/startGameLoop";
import {IGameSettings} from "../data/_types/IGameSettings";
import {IGameState} from "../data/_types/IGameState";
import {Graphics} from "../graphics/Graphics";

const settings: IGameSettings = {
    width: 1000,
    height: 500,
};
const state: IGameState = {
    faces: [
        {
            data: "1",
            polygon: [
                [50, 50],
                [200, 40],
                [320, 200],
                [250, 300],
                [200, 250],
                [100, 250],
                [40, 350],
            ],
        },
        {
            data: "2",
            polygon: [
                [280, 70],
                [400, 120],
                [450, 200],
                [400, 350],
                [200, 450],
                [230, 400],
                [300, 350],
                [260, 300],
                [200, 270],
            ],
        },
    ].map(({data, polygon}) => ({data, polygon: polygon.map(([x, y]) => ({x, y}))})),
};

export const App: FC = () => {
    useEffect(() => {
        const disposeLoop = startGameLoop(state, settings);

        return () => {
            disposeLoop();
        };
    }, []);

    return <Graphics state={state} settings={settings} />;
};
