export type IEditorConfig = {
    // Polygon properties
    /** The default polygon infill color */
    polygonColor: string;
    /** The default polygon edge color */
    polygonEdgeColor: string;
    /** The default polygon point color */
    polygonPointColor: string;

    /** The default polygon infill opacity */
    polygonOpacity: number;
    /** The default polygon edge opacity */
    polygonEdgeOpacity: number;
    /** The default polygon point opacity */
    polygonPointOpacity: number;

    /** The default polygon edge size */
    polygonEdgeSize: number;
    /** The default polygon point size */
    polygonPointSize: number;

    // Selection
    /** The size of a selected polygon point */
    polygonPointSelectSize: number;
    /** The opacity of a selected polygon point*/
    polygonPointSelectOpacity: number;
    /** The opacity of a selected polygon */
    polygonSelectOpacity: number;

    // Layout
    /** Whether to show the axis */
    showAxis: boolean;
    /** How to display the grid */
    grid: "none" | "major" | "minor";

    // Interaction
    /** What points to snap to */
    snap: {
        /** What parts of the grid can be snapped to */
        grid: "none" | "major" | "minor";
        /** Whether to snap to be on nearby lines */
        lines: boolean;
        /** Whether to snap to be on nearby points */
        points: boolean;
    };
    /** The distance that can be snapped over */
    snapDistance: number;
    /** How quickly to zoom in and out (0-1) */
    zoomSpeed: number;
};
