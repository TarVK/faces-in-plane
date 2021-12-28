import {defaultVertex, Filter} from "@pixi/core";
import {hex2rgb} from "@pixi/utils";

// Based on: https://stackoverflow.com/q/16909816/8521718
/**
 * Maps the green input color to a given color
 */
export class RecolorFilter extends Filter {
    /**
     * @param outputColor The output color
     */
    constructor(outputColor: number) {
        super(
            defaultVertex,
            `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform vec3 outputColor;
            
            void main(void) {
                vec4 textureColor = texture2D(uSampler, vTextureCoord);

                float value = textureColor.g;
                float saturation = 1.0-textureColor.r;

                vec3 newColor = vec3(
                    value * (outputColor.r + (1.0 - outputColor.r) * (1.0 - saturation)),
                    value * (outputColor.g + (1.0 - outputColor.g) * (1.0 - saturation)),
                    value * (outputColor.b + (1.0 - outputColor.b) * (1.0 - saturation))
                );

                gl_FragColor = vec4(newColor, 1.0);
            }
        `,
            {outputColor: hex2rgb(outputColor)}
        );
    }
}
