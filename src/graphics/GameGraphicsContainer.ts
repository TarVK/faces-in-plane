import {Graphics} from "@pixi/graphics";
import {Container, Renderer, Text} from "pixi.js";
import {IGameSettings} from "../data/_types/IGameSettings";
import {IGameState} from "../data/_types/IGameState";
import {getSeededRandom} from "../utils/_tests/shuffle.helper";

/**
 * The container for the graphics of the game,
 * given a reference to the game data, it will update the visuals every frame
 */
export class GameGraphicsContainer extends Container {
    protected state: IGameState;
    protected settings: IGameSettings;
    protected graphics: Graphics;
    protected texts: Text[] = [];

    /**
     * Creates a new graphics container
     * @param state The object representing the state of the game
     * @param settings The settings of the game
     */
    public constructor(state: IGameState, settings: IGameSettings) {
        super();
        this.state = state;
        this.settings = settings;
        this.graphics = new Graphics();
        this.addChild(this.graphics);
    }

    /** @override */
    public updateTransform() {
        this.updateGraphics();
        super.updateTransform();
    }

    /**
     * Recalculates all the graphics on screen
     */
    public updateGraphics() {
        this.texts.forEach(text => text.destroy());
        this.texts = [];

        const random = getSeededRandom(4);
        this.state.faces.forEach((face, i) => {
            const r = random(),
                g = random(),
                b = random();
            this.graphics.beginFill(0x777777 + r * 0x880000 + g * 0x8800 + b * 0x88);
            this.graphics.drawPolygon(face.polygon.flatMap(({x, y}) => [x, y]));
            this.graphics.endFill();

            const center = face.polygon.reduce(
                ({x: cx, y: cy}, {x, y}, i) => ({
                    x: cx + (x - cx) / (i + 1),
                    y: cy + (y - cy) / (i + 1),
                }),
                {x: 0, y: 0}
            );
            const text = new Text(JSON.stringify(face.data));
            text.position.set(center.x, center.y);
            text.scale.y = -1;
            this.texts.push(text);
            this.graphics.addChild(text);
        });
    }
}
