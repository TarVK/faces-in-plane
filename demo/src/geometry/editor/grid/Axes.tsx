import React, {FC} from "react";
import {IAxisProps} from "../_types/IAxisProps";

export const XAxis: FC<IAxisProps> = ({containerSize, offset, scale, spacing}) => {
    const labels = [];

    const s = spacing * scale;
    const start = Math.floor(offset.x / s) * spacing;
    for (
        let i = -Math.floor(containerSize.x / 2 / s) - 1;
        i * s < containerSize.x / 2;
        i++
    ) {
        const x = i * s;
        const valNum = i * spacing - start;
        const val = formatNumber(valNum);
        labels.push(
            <div
                key={i}
                style={{
                    position: "absolute",
                    left: x + containerSize.x / 2 + (((offset.x % s) + s) % s) - 15,
                    background: "white",
                    fontSize: val.length <= 4 ? 16 : 60 / val.length,
                    lineHeight: "16px",
                }}>
                {val}
            </div>
        );
    }

    return (
        <div
            className="xAxis"
            style={{
                position: "absolute",
                left: 0,
                right: 0,
            }}>
            <div
                style={{
                    top: containerSize.y / 2 - offset.y,
                    position: "absolute",
                    left: 0,
                    right: 0,
                    borderTop: "1px solid grey",
                }}></div>
            <div
                style={{
                    top: Math.max(
                        0,
                        Math.min(containerSize.y - 20, containerSize.y / 2 - offset.y)
                    ),
                    position: "absolute",
                    borderTop: "1px solid transparent",
                    left: 0,
                    right: 0,
                }}>
                {labels}
            </div>
        </div>
    );
};

export const YAxis: FC<IAxisProps> = ({containerSize, offset, scale, spacing}) => {
    const labels = [];

    const s = spacing * scale;
    const start = Math.floor(offset.y / s) * spacing;
    for (
        let i = -Math.floor(containerSize.y / 2 / s) - 1;
        i * s < containerSize.y / 2;
        i++
    ) {
        const y = i * s;
        const valNum = i * spacing - start;
        const val = formatNumber(valNum);

        if (valNum != 0)
            labels.push(
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        top: -y + containerSize.y / 2 - (((offset.y % s) + s) % s) - 8,
                        background: "white",
                        fontSize: val.length <= 4 ? 16 : 60 / val.length,
                        lineHeight: "16px",
                        right: 8,
                    }}>
                    {val}
                </div>
            );
    }

    return (
        <div
            className="yAxis"
            style={{
                position: "absolute",
                top: 0,
                bottom: 0,
            }}>
            <div
                style={{
                    left: containerSize.x / 2 + offset.x,
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    borderRight: "1px solid grey",
                }}></div>
            <div
                style={{
                    left: Math.max(
                        40,
                        Math.min(containerSize.x, containerSize.x / 2 + offset.x)
                    ),
                    position: "absolute",
                    borderRight: "1px solid transparent",
                    top: 0,
                    bottom: 0,
                }}>
                {labels}
            </div>
        </div>
    );
};

function formatNumber(val: number): string {
    return Math.round(val * 1e10) / 1e10 + "";
}
