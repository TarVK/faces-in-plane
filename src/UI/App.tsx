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

// const inputFaces: IFace<number>[] = createFaces([
//     {
//         data: 1,
//         polygon: [
//             [250, 50],
//             [350, 150],
//             [300, 250],
//             [150, 150],
//         ],
//     },
//     {
//         data: 2,
//         polygon: [
//             [300, 50],
//             [400, 150],
//             [300, 250],
//             [200, 150],
//         ],
//     },
// ]);
// const inputFaces: IFace<number>[] = createFaces([
//     {
//         data: 2,
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
//     {
//         data: 1,
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
// ]);
// const inputFaces: IFace<number>[] = createFaces([
//     {
//         data: 1,
//         polygon: [
//             [150, 50],
//             [250, 100],
//             [250, 200],
//             [150, 250],
//             [50, 200],
//             [50, 100],
//         ],
//     },
//     {
//         data: 2,
//         polygon: [
//             [150, 100],
//             [200, 150],
//             [150, 200],
//             [100, 150],
//         ],
//     },
// ]);
// const inputFaces: IFace<number>[] = createFaces([
//     {
//         data: 1,
//         polygon: [
//             [50, 50],
//             [150, 50],
//             [150, 150],
//             [50, 150],
//         ],
//     },
//     {
//         data: 2,
//         polygon: [
//             [150, 50],
//             [250, 50],
//             [250, 250],
//             [50, 250],
//             [50, 150],
//             [150, 150],
//         ],
//     },
// ]);
// const inputFaces: IFace<number>[] = createFaces([
//     {
//         data: 1,
//         polygon: [
//             [50, 50],
//             [150, 50],
//             [150, 150],
//             [50, 150],
//         ],
//     },
//     {
//         data: 2,
//         polygon: [
//             [150, 50],
//             [250, 50],
//             [250, 250],
//             [50, 250],
//             [50, 150],
//             [150, 130],
//         ],
//     },
// ]);
const inputFaces: IFace<number>[] = createFaces([
    {
        data: 1,
        polygon: [
            [100, 100],
            [150, 150],
            [100, 200],
            [50, 150],
        ],
    },
    {
        data: 2,
        polygon: [
            [100, 50],
            [250, 50],
            [250, 250],
            [100, 250],
        ],
    },
    {
        data: 3,
        polygon: [
            [75, 50],
            [200, 200],
            [125, 150],
        ],
    },
]);

function separate<T>(faces: IFace<T>[], amount: number): IFace<T>[] {
    return faces.map((face, i) => ({
        ...face,
        polygon: face.polygon.map(p => ({x: p.x + amount * i, y: p.y})),
    }));
}
function scale<T>(faces: IFace<T>[], amount: number): IFace<T>[] {
    return faces.map((face, i) => ({
        ...face,
        polygon: face.polygon.map(p => ({x: p.x * amount, y: p.y * amount})),
    }));
}

const combinedFaces = combineFaces(inputFaces).map(({data, polygon}) => ({
    polygon,
    data: data.map(({data}) => data),
}));
console.log(combinedFaces);

const state: IGameState = {
    // faces: separate(scale(inputFaces, 3), 600),
    // faces: separate(scale(inputFaces, 3), 0),
    faces: separate(scale(combinedFaces, 2), 0),
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
