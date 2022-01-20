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
        /** Whether to snap to major grid points */
        gridMajor: boolean;
        /** Whether to snap to minor grid points */
        gridMinor: boolean;
        /** Whether to snap to be on nearby lines */
        lines: boolean;
        /** Whether to snap to be on nearby points */
        points: boolean;
        /** Whether to disable all snapping, this overrides the other options */
        disableAll: boolean;
    };
    /** The distance that can be snapped over */
    snapDistance: {
        /** How far may be snapped on major grid points */
        gridMajor: number;
        /** How far may be snapped on minor grid points */
        gridMinor: number;
        /** How far may be snapped on lines */
        lines: number;
        /** How far may be snapped on points */
        points: number;
    };
    /** How quickly to zoom in and out (0-1) */
    zoomSpeed: number;
};
