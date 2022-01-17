import {IFace, IPoint} from "face-combiner";
import {DataCacher, Field, IDataHook} from "model-react";
import {getDistance} from "../getDistance";
import {isPointInAABB} from "../isPointInAABB";
import {isPointInPolygon} from "../isPointInPolygon";
import {IBoundingBox} from "../_types/IBoundingBox";
import {IEditorConfig} from "./_types/IEditorConfig";
import {IEditorFace} from "./_types/IEditorFace";
import {IEditorTool} from "./_types/IEditorTool";
import {ITransformation} from "./_types/ITransformation";

export class GeometryEditorState {
    protected polygonData = new Field<
        {
            face: Field<IEditorFace>;
            aabb: DataCacher<IBoundingBox>;
        }[]
    >([]);

    protected polygons = new DataCacher<Field<IEditorFace>[]>(h =>
        this.polygonData.get(h).map(({face}) => face)
    );

    protected transformation = new Field<ITransformation>({
        offset: {x: 0, y: 0},
        scale: 1,
    });

    protected selection = new Field<{
        face: Field<IEditorFace>;
        point: Field<number | undefined>;
    } | null>(null);
    protected tool = new Field<IEditorTool>("create");

    protected config = new Field<IEditorConfig>({
        polygonColor: "#0000FF",
        polygonEdgeColor: "#0000BB",
        polygonPointColor: "#0000FF",
        polygonOpacity: 0.3,
        polygonEdgeOpacity: 1,
        polygonPointOpacity: 0.6,
        polygonEdgeSize: 2,
        polygonPointSize: 6,

        polygonPointSelectOpacity: 0.8,
        polygonPointSelectSize: 10,
        polygonSelectOpacity: 0.6,

        grid: "minor",
        showAxis: true,
        snap: {
            grid: "minor",
            lines: true,
            points: true,
        },
        snapDistance: 20,
        zoomSpeed: 0.1,
    });

    /**
     * Retrieves all the polygons in the editor
     * @param hook The hook to subscribe to changes
     * @returns The polygon fields
     */
    public getPolygons(hook?: IDataHook): Field<IEditorFace>[] {
        return this.polygons.get(hook);
    }

    /**
     * Retrieves all polygons except for the currently selected polygon
     * @param hook The hook to subscribe to changes
     * @returns The polygons except for the selected one
     */
    public getNonSelectedPolygons(hook?: IDataHook): Field<IEditorFace>[] {
        const selected = this.selection.get(hook);
        return this.polygons.get(hook).filter(poly => selected?.face != poly);
    }
    /**
     * Retrieves the currently selected polygon
     * @param hook The hook to subscribe to changes
     * @returns The selected polygon
     */
    public getSelectedPolygon(hook?: IDataHook): IEditorFace | undefined {
        const face = this.selection.get(hook);
        if (!face) return undefined;

        return face.face.get(hook);
    }

    /**
     * Retrieves the currently selected point
     * @param hook The hook to subscribe to changes
     * @returns The selected point
     */
    public getSelectedPoint(hook?: IDataHook): IPoint | undefined {
        const index = this.getSelectedPointIndex(hook);
        if (index == undefined) return;
        const face = this.getSelectedPolygon(hook);
        return face?.polygon[index];
    }

    /**
     * Retrieves the currently selected point index
     * @param hook The hook to subscribe to changes
     * @returns The selected point index
     */
    public getSelectedPointIndex(hook?: IDataHook): number | undefined {
        const face = this.selection.get(hook);
        if (!face) return undefined;
        return face.point.get(hook);
    }

    /**
     * Retrieves the currently selected tool
     * @param hook The hook to subscribe to changes
     * @returns The currently selected tool
     */
    public getSelectedTool(hook?: IDataHook): IEditorTool {
        return this.tool.get(hook);
    }

    /**
     * Sets the currently selected tool
     * @param tool THe tool to be selected
     */
    public setSelectedTool(tool: IEditorTool): void {
        this.tool.set(tool);
    }

    // Searching
    /**
     * Retrieves the selected polygon's closest point to the input point
     * @param point The point to look for
     * @param maxIndex The maximum index to select if duplicate min distance points are found
     * @param hook The hook to subscribe to changes
     * @returns The found point
     */
    public findNearestSelectionPoint(
        point: IPoint,
        maxIndex: number = Infinity,
        hook?: IDataHook
    ): {point: IPoint; index: number} | undefined {
        const face = this.getSelectedPolygon(hook);
        if (!face) return undefined;

        const match = face.polygon.reduce(
            (best, p, i) => {
                const dist = getDistance(point, p);
                if (dist < best.dist || (i < maxIndex && dist == best.dist))
                    return {
                        dist,
                        point: p,
                        index: i,
                    };
                return best;
            },
            {point: undefined, index: undefined, dist: Infinity}
        );

        if (match.point)
            return {
                point: match.point,
                index: match.index,
            };
    }

    /**
     * Retrieves a polygon that intersects the given point
     * @param point The point to be checked
     * @param before The face at this point to get the face in front of, can be used to cycle through faces at the same point
     * @param hook The hook to subscribe to changes
     */
    public findIntersectingPolygon(
        point: IPoint,
        before?: IEditorFace,
        hook?: IDataHook
    ): IEditorFace | undefined {
        let found: IEditorFace | undefined;

        for (let {face, aabb} of this.polygonData.get(hook)) {
            const faceData = face.get(hook);
            if (found && faceData == before) return found;

            if (!isPointInAABB(point, aabb.get(hook))) continue;
            if (!isPointInPolygon(point, faceData.polygon)) continue;

            found = faceData;
        }

        return found;
    }

    // Configuration
    /**
     * Sets the configuration of the editor
     * @param config The new configuration for the editor
     */
    public setConfig(config: IEditorConfig): void {
        this.config.set(config);
    }

    /**
     * Retrieves the configuration of the editor
     * @param hook The hook to subscribe to changes
     * @returns The retrieved configuration
     */
    public getConfig(hook?: IDataHook): IEditorConfig {
        return this.config.get(hook);
    }

    // Tools
    /**
     * Sets all the faces of the editor
     * @param faces The faces to be set
     */
    public setPolygons(faces: (IEditorFace | Field<IEditorFace>)[]): void {
        this.deselectPolygon();
        const normalizedFaces = faces.map(face => {
            const faceSource = "set" in face ? face : new Field(face);
            return {
                face: faceSource,
                aabb: this.createBoundingBoxSource(faceSource),
            };
        });
        this.polygonData.set(normalizedFaces);
    }

    /**
     * Creates a datacacher for a given face source
     * @param face The face source to create the cacher for
     * @returns The created cacher
     */
    protected createBoundingBoxSource(
        face: Field<IEditorFace>
    ): DataCacher<IBoundingBox> {
        return new DataCacher(h => {
            const {polygon} = face.get(h);
            let xMin = Infinity;
            let xMax = -Infinity;
            let yMin = Infinity;
            let yMax = -Infinity;
            for (let point of polygon) {
                if (point.x < xMin) xMin = point.x;
                if (point.x > xMax) xMax = point.x;
                if (point.y < yMin) yMin = point.y;
                if (point.y > yMax) yMax = point.y;
            }
            return {
                xMin,
                yMin,
                xMax,
                yMax,
            };
        });
    }

    /**
     * Selects the specified polygon if it's in the polygon set
     * @param face The face to be selected
     * @returns Whether the specified polygon was successfully selected
     */
    public selectPolygon(face: IEditorFace): boolean {
        const polygons = this.polygons.get();
        const polygon = polygons.find(polygon => polygon.get() == face);
        if (!polygon) return false;
        this.selection.set({
            face: polygon,
            point: new Field(undefined),
        });
        return true;
    }

    /**
     * Selects the specified point index of the selected polygon if it exists
     * @param index The index to be selected
     * @returns Whether the specified index could be selected
     */
    public selectPolygonPoint(index: number): boolean {
        const face = this.getSelectedPolygon();
        if (!face) return false;
        if (index >= face.polygon.length || index < 0) return false;
        this.selection.get()?.point.set(index);
        return true;
    }

    /**
     * Deselectss the currently selected polygon
     */
    public deselectPolygon(): void {
        const selected = this.getSelectedPolygon();
        if (selected && selected.polygon.length <= 2) {
            const newFaces = this.polygonData
                .get()
                .filter(({face}) => face.get() != selected);
            this.polygonData.set(newFaces);
        }
        if (selected) this.selection.set(null);
    }

    /**
     * Deselects the currently selected point
     */
    public deselectPoint(): void {
        this.selection.get()?.point.set(undefined);
    }

    /**
     * Deletes the currently selected polygon
     */
    public deletePolygon(): void {
        const selected = this.getSelectedPolygon();
        if (!selected) return;
        this.deselectPolygon();
        const newFaces = this.polygonData
            .get()
            .filter(({face}) => face.get() != selected);
        this.polygonData.set(newFaces);
    }

    /**
     * Deletes the currently selected polygon point
     */
    public deletePoint(): void {
        this.updatePolygon((face, index) => {
            if (index == undefined) return face;
            const newPoints = [
                ...face.polygon.slice(0, index),
                ...face.polygon.slice(index + 1),
            ];
            return {...face, polygon: newPoints};
        });
        this.deselectPoint();
    }

    /**
     * Moves the polygon by the specified amount
     * @param delta The delta to move the polygon by
     */
    public movePolygon(delta: IPoint): void {
        this.updatePolygon((face, index) => {
            const newPoints = face.polygon.map(({x, y}) => ({
                x: x + delta.x,
                y: y + delta.y,
            }));
            return {...face, polygon: newPoints};
        });
    }

    /**
     * Moves the currently selected point
     * @param point The new position of the point
     */
    public movePoint(point: IPoint): void {
        const snappedPoint = this.snapToGrid(point, true);
        this.updatePolygon((face, index) => {
            if (index == undefined) return face;
            const newPoints = [
                ...face.polygon.slice(0, index),
                snappedPoint,
                ...face.polygon.slice(index + 1),
            ];
            return {...face, polygon: newPoints};
        });
    }

    /**
     * Adds a point to the selected polygon, or creates a new polygon if none is selected
     * @param point The point to add to the polygon
     */
    public addPoint(point: IPoint): void {
        if (this.selection.get() == null) {
            const newPolygon = new Field<IEditorFace>({
                data: "",
                polygon: [],
            });
            this.selection.set({
                face: newPolygon,
                point: new Field(undefined),
            });
            this.polygonData.set([
                ...this.polygonData.get(),
                {
                    face: newPolygon,
                    aabb: this.createBoundingBoxSource(newPolygon),
                },
            ]);
        }

        const snappedPoint = this.snapToGrid(point, true);
        this.updatePolygon((face, index) => {
            if (index == undefined) index = face.polygon.length;
            const newPoints = [
                ...face.polygon.slice(0, index + 1),
                snappedPoint,
                ...face.polygon.slice(index + 1),
            ];
            return {...face, polygon: newPoints};
        });
    }

    /**
     * Updates the selected face using the given update function
     * @param update The update function
     */
    protected updatePolygon(
        update: (face: IEditorFace, selectedPoint: number | undefined) => IEditorFace
    ): void {
        const selectedPolygon = this.getSelectedPolygon();
        if (!selectedPolygon) return;
        const index = this.getSelectedPointIndex();
        this.selection.get()!.face.set(update(selectedPolygon, index));
    }

    // Visual settings
    /**
     * Retrieves the grid size based on the current zoom factor
     * @param hook The hook to subscribe to changes
     * @returns The distance between lines on the grid, in world units
     */
    public getGridSize(hook?: IDataHook): number {
        const {scale} = this.transformation.get(hook);

        // TODO: make configurarable
        const desiredSpacing = {
            pixels: 50, // The minimum number of pixels between lines in the grid on the screen
            units: 100, // The base units on the screen
        };

        const baseScale = desiredSpacing.units / desiredSpacing.pixels;
        const relScale = scale * baseScale;
        const baseFactor = baseScale / Math.pow(10, Math.floor(Math.log10(relScale)));

        // Try to subdivide the factor further
        let factor = baseFactor;
        if (factor * 0.2 * scale > 1) {
            factor *= 0.2;
        } else if (factor * 0.5 * scale > 1) {
            factor *= 0.5;
        }

        return factor * desiredSpacing.pixels;
    }

    // Transformation related methods
    /**
     * Retrieves the transformation of the editor
     * @param hook The hook to subscribe to changes
     * @returns The transformation of the editor
     */
    public getTransformation(hook?: IDataHook): ITransformation {
        return this.transformation.get(hook);
    }

    /**
     * Sets the transformation of the editor
     * @param transformation The new transformation
     */
    public setTransformation(transformation: ITransformation): void {
        this.transformation.set(transformation);
    }

    /**
     * Translates the given amount in screen coordinates
     * @param x The amount on the x-axis
     * @param y The amount on the y-axis
     */
    public translate(x: number, y: number): void {
        const {offset, scale} = this.transformation.get();
        this.transformation.set({
            offset: {
                x: x + offset.x,
                y: y + offset.y,
            },
            scale,
        });
    }

    /**
     * Updates to the new scale and ensures that the target point remains in the same position
     * @param newScale The new scale to set
     * @param target The point that should stay in the same location (in screen coordinates, where (0,0) is the middle of the screen)
     */
    public scaleAt(newScale: number, target: IPoint): void {
        const {offset, scale} = this.transformation.get();

        const scalePos = {
            x: -offset.x + target.x,
            y: -offset.y + target.y,
        };

        const delta = {
            x: (scalePos.x / scale) * newScale - scalePos.x,
            y: (scalePos.y / scale) * newScale - scalePos.y,
        };

        this.transformation.set({
            offset: {
                x: offset.x - delta.x,
                y: offset.y - delta.y,
            },
            scale: newScale,
        });
    }

    // Util
    /**
     * Snaps the given point to the grid depending on the selected sensitivity
     * @param point The point to be snapped
     * @param onlyIfEnalbed Whether to not snap in case the user disabled snapping
     * @returns The snapped point
     */
    public snapToGrid(point: IPoint, onlyIfEnalbed?: boolean): IPoint {
        // TODO: add a setting to disable snapping and change sensitivity

        // Obtain closest point on the grid
        const gridline = this.getGridSize() / 5;
        const snapPoint = {
            x: Math.round(point.x / gridline) * gridline,
            y: Math.round(point.y / gridline) * gridline,
        };

        // Check the distance
        const dist = getDistance(snapPoint, point);
        const pixelDist = dist * this.getTransformation().scale;
        if (pixelDist < this.getConfig().snapDistance) return snapPoint;
        else return point;
    }
}
