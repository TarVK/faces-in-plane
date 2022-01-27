import {getTheme, PrimaryButton} from "@fluentui/react";
import {combineFaces} from "face-combiner";
import React, {FC, useCallback, useState} from "react";
import {cleanupPolygons} from "../geometry/cleanupPolygons";
import {GeometryEditorState} from "../geometry/editor/GeometryEditorState";
import {IEditorFace} from "../geometry/editor/_types/IEditorFace";
import {StandardModal} from "../util/Modal";

export const ConvertButton: FC<{
    input: GeometryEditorState;
    output: GeometryEditorState;
}> = ({input, output}) => {
    const [invalid, setInvalid] = useState<IEditorFace[]>([]);
    const [error, setError] = useState<Error | undefined>();
    const callCombineFaces = useCallback(() => {
        try {
            const polygons = input.getPolygons().map(polygon => polygon.get());
            const {valid: cleanedPolygons, invalid} = cleanupPolygons(polygons);
            const combined = combineFaces(cleanedPolygons);

            const combinedSimplified = combined.map(polygon => ({
                ...polygon,
                data: polygon.data.map(({data}) => data),
            }));
            output.setPolygons(combinedSimplified);

            setInvalid(invalid);
        } catch (e) {
            console.dir(e);
            setError(e);
            output.setPolygons([]);
        }
    }, [input, output]);

    return (
        <>
            <StandardModal
                visible={invalid.length > 0}
                onClose={() => setInvalid([])}
                title="Invalid polygons">
                The input contains self-intersecting polygons. The algorithm can't handle
                these polygons, therefore these have been left out of the result.
            </StandardModal>
            <StandardModal
                visible={error != undefined}
                onClose={() => setError(undefined)}
                title="Algorithm failed">
                A failure of the algorithm was detected. There are many robustness issues
                that can cause the algorithm to compute an incorrect result, one of which
                just occured.
            </StandardModal>
            <PrimaryButton onClick={callCombineFaces}>Combine polygons</PrimaryButton>
        </>
    );
};
