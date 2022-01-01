import {Field} from "model-react";
import React, {FC, useEffect, useMemo} from "react";
import {startGameLoop} from "../controller/startGameLoop";
import {IFace} from "../data/_types/IFace";
import {IGameSettings} from "../data/_types/IGameSettings";
import {IGameState} from "../data/_types/IGameState";
import {combineFaces} from "../faceCombining/combineFaces";
import {Graphics} from "../graphics/Graphics";

const settings: IGameSettings = {
    width: 1000,
    height: 500,
};

const createFaces = <S extends any>(inputs: {data: S; polygon: [number, number][]}[]) =>
    inputs.map(({data, polygon}) => ({data, polygon: polygon.map(([x, y]) => ({x, y}))}));

// const inputFaces: IFace<string>[] = createFaces([
//     {
//         data: "1",
//         polygon: [
//             [50, 50],
//             [200, 40],
//             [320, 200],
//             [250, 300],
//             [200, 250],
//             [100, 250],
//             [40, 350],
//         ],
//     },
//     {
//         data: "2",
//         polygon: [
//             [280, 70],
//             [400, 120],
//             [450, 200],
//             [400, 350],
//             [200, 450],
//             [230, 400],
//             [300, 350],
//             [260, 300],
//             [200, 270],
//         ],
//     },
// ]);
const inputFaces: IFace<number>[] = createFaces([
    {
        data: 1,
        polygon: [
            [250, 50],
            [350, 150],
            [250, 250],
            [150, 150],
        ],
    },
    {
        data: 2,
        polygon: [
            [300, 50],
            [400, 150],
            [300, 250],
            [200, 150],
        ],
        // polygon: [
        //     [600, 50],
        //     [700, 150],
        //     [600, 250],
        //     [500, 150],
        // ],
    },
]);
const combinedFaces = combineFaces(inputFaces).map(({data, polygon}) => ({
    polygon,
    data: data.map(({data}) => data),
}));
console.log(combinedFaces);

const state: IGameState = {
    faces: combinedFaces,
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
