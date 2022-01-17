import {mergeStyles} from "@fluentui/react";
import React, {FC} from "react";
import {IGridProps} from "../_types/IGridProps";

export const Grid: FC<IGridProps> = ({offset, gridSize, scale, type}) => {
    const size = gridSize * scale;
    if (type == "none") return <></>;
    return (
        <div className={`grid ${styles}`}>
            {type == "minor" && (
                <div
                    className="minor"
                    style={{
                        backgroundPositionX: `calc(50% + ${offset.x % size}px + ${
                            size / 2
                        }px)`,
                        backgroundPositionY: `calc(50% + ${-offset.y % size}px + ${
                            size / 2
                        }px)`,
                        backgroundSize: `${size / 5}px ${size / 5}px`,
                    }}
                />
            )}
            <div
                className="major"
                style={{
                    backgroundPositionX: `calc(50% + ${offset.x % size}px + ${
                        size / 2
                    }px)`,
                    backgroundPositionY: `calc(50% + ${-offset.y % size}px + ${
                        size / 2
                    }px)`,
                    backgroundSize: `${size}px ${size}px`,
                }}
            />
        </div>
    );
};

const styles = mergeStyles({
    ".minor": {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundImage: `
            linear-gradient(to right, #EEEEEE 0.5px, transparent 1px),
            linear-gradient(to bottom, #EEEEEE 0.5px, transparent 1px)`,
    },
    ".major": {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundImage: `
            linear-gradient(to right, #CCCCCC 1px, transparent 1px),
            linear-gradient(to bottom, #CCCCCC 1px, transparent 1px)`,
    },
});
