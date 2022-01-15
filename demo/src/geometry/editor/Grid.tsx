import {mergeStyles} from "@fluentui/react";
import React, {FC} from "react";
import {IGridProps} from "./_types/IGridProps";

export const Grid: FC<IGridProps> = ({offset, gridSize, scale}) => {
    return (
        <div className={`grid ${styles}`}>
            <div
                className="minor"
                style={{
                    backgroundPositionX: `calc(50% + ${offset.x}px + ${
                        (gridSize * scale) / 5 / 2
                    }px)`,
                    backgroundPositionY: `calc(50% + ${-offset.y}px + ${
                        (gridSize * scale) / 5 / 2
                    }px)`,
                    backgroundSize: `${(gridSize * scale) / 5}px ${
                        (gridSize * scale) / 5
                    }px`,
                }}
            />
            <div
                className="major"
                style={{
                    backgroundPositionX: `calc(50% + ${offset.x}px + ${
                        (gridSize * scale) / 2
                    }px)`,
                    backgroundPositionY: `calc(50% + ${-offset.y}px + ${
                        (gridSize * scale) / 2
                    }px)`,
                    backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
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
