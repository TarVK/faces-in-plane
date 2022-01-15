import {IFace, IPoint} from "face-combiner";
import {Field, IDataHook} from "model-react";
import {ITransformation} from "./_types/ITransformation";

export class GeometryEditorState {
    protected polygons = new Field<Field<IFace<string>>[]>([]);

    protected transformation = new Field<ITransformation>({
        offset: {x: 0, y: 0},
        scale: 1,
    });

    protected selection = new Field<Field<IFace<string>> | null>(null);
    protected tool = new Field<"selection" | "edit">("selection");

    /**
     * Retrieves all the polygons in the editor
     * @param hook The hook to subscribe to changes
     * @returns The polygon fields
     */
    public getPolygons(hook?: IDataHook): Field<IFace<string>>[] {
        return this.polygons.get(hook);
    }

    // Visual settings
    /**
     * Retrieves the grid size based on the current zoom factor
     * @param hook The hook to subscribe to changes
     * @returns The distance between lines on the grid, in world units
     */
    public getGridSize(hook?: IDataHook): number {
        // const {scale} = this.transformation.get(hook);
        // const desiredPixelSpacing = 50; // TODO: add setting
        // return (1 / Math.pow(2, Math.round(Math.log2(scale)))) * desiredPixelSpacing;

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
}
