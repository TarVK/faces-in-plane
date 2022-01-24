import {getTheme, PrimaryButton} from "@fluentui/react";
import {combineFaces} from "face-combiner";
import React, {FC, useCallback} from "react";
import {GeometryEditorState} from "../geometry/editor/GeometryEditorState";
import {cleanupPolygons} from "./cleanupPolygons";

const theme = getTheme();
export const Controls: FC<{
    input: GeometryEditorState;
    output: GeometryEditorState;
}> = ({input, output}) => {
    const callCombineFaces = useCallback(() => {
        const polygons = input.getPolygons().map(polygon => polygon.get());
        const {valid: cleanedPolygons, invalid} = cleanupPolygons(polygons);
        const combined = combineFaces(cleanedPolygons);

        const combinedSimplified = combined.map(polygon => ({
            ...polygon,
            data: polygon.data.map(({data}) => data),
        }));
        output.setPolygons(combinedSimplified);
    }, [input, output]);

    return (
        <div
            style={{
                width: 350,
                padding: theme.spacing.s1,
                height: "100%",
                boxShadow: "rgb(0 0 0 / 24%) 0px 0px 9px 3px",
                background: "white",
                boxSizing: "border-box",
            }}>
            <PrimaryButton onClick={callCombineFaces}>Combine faces</PrimaryButton>
        </div>
    );
};
