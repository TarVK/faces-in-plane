import React, {FC, useState} from "react";
import {ChromePicker} from "react-color";
import {Popover} from "react-tiny-popover";
import Color from "color";

export const ColorInput: FC<{
    value: string;
    opacity?: number;
    onChange: (color: string, opacity: number) => void;
    alpha?: boolean;
}> = ({opacity, value, onChange, alpha = true}) => {
    const [pickerShown, setPickerShown] = useState(false);

    let color:
        | {
              r: number;
              g: number;
              b: number;
              a: number;
          }
        | string = value;
    if (alpha) {
        const c = Color(value);
        color = {
            r: c.red(),
            g: c.green(),
            b: c.blue(),
            a: opacity ?? 1,
        };
    }

    return (
        <>
            <Popover
                isOpen={pickerShown}
                positions={["bottom"]}
                containerStyle={{
                    zIndex: "10000000000",
                }}
                onClickOutside={() => setPickerShown(false)}
                content={
                    <ChromePicker
                        color={color}
                        onChange={color => onChange(color.hex, color.rgb.a ?? 1)}
                        disableAlpha={!alpha}
                    />
                }>
                <div
                    style={{
                        width: 30,
                        height: 30,
                        backgroundColor:
                            typeof color == "string"
                                ? color
                                : `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
                        boxShadow: "rgb(0 0 0 / 40%) 0px 0px 2px",
                    }}
                    onClick={() => setPickerShown(true)}
                />
            </Popover>
        </>
    );
};
