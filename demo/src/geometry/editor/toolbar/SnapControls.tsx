import React, {FC, useCallback} from "react";
import {GeometryEditorState} from "../GeometryEditorState";
import {DirectionalHint, getTheme, Slider} from "@fluentui/react";
import {useDataHook} from "model-react";
import {IEditorConfig} from "../_types/IEditorConfig";
import {ExpandableSidebarButton} from "./ExpandableSidebarButton";
import {SidebarButton} from "./SidebarButton";

export const SnapControls: FC<{state: GeometryEditorState}> = ({state}) => {
    const [h] = useDataHook();

    const updateConfig = useCallback(
        (getNewConfig: (cfg: IEditorConfig) => IEditorConfig) => {
            const config = state.getConfig();
            state.setConfig(getNewConfig(config));
        },
        [state]
    );

    const cfg = state.getConfig(h);
    const maxSnap = 35;

    return (
        <ExpandableSidebarButton
            icon={
                <svg
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="-60 -60 630 630" // Original: 0 0 512 512
                    xmlSpace="preserve">
                    <g>
                        <g>
                            <path
                                fill={getTheme().palette.themePrimary}
                                d="M507.123,264.039l-70.597-70.598c-3.122-3.122-7.357-4.877-11.773-4.877c-4.416,0-8.651,1.754-11.773,4.877
			l-70.598,70.598l-95.349,95.349c-11.161,11.16-25.219,17.787-40.657,19.167c-0.043,0.003-0.087,0.008-0.13,0.012
			c-19.91,1.939-39.426-5.056-53.549-19.178c-17.24-17.241-23.675-42.527-16.81-66.011c3.467-11.216,8.966-20.481,16.81-28.326
			l95.35-95.349l70.597-70.598c6.502-6.501,6.502-17.044,0-23.547L248.048,4.962c-6.5-6.502-17.043-6.502-23.547,0l-70.598,70.597
			l-95.349,95.35c-23.881,23.88-40.755,52.364-50.154,84.658c-21.064,70.438-1.853,146.283,50.152,197.965
			c37.272,37.567,87.843,58.384,140.615,58.384c5.16,0,10.344-0.2,15.537-0.602c47.703-3.406,92.617-23.927,126.472-57.782
			l95.35-95.35l70.597-70.597C513.627,281.084,513.627,270.541,507.123,264.039z M236.274,40.282l47.05,47.05l-47.05,47.051
			l-47.05-47.052L236.274,40.282z M424.754,322.862l-23.526-23.524l-23.526-23.524l47.051-47.051l47.05,47.051L424.754,322.862z"
                            />
                        </g>
                    </g>
                </svg>
            }
            hover={"Snap to points"}
            title="Snap to points"
            onClick={() =>
                updateConfig(cfg => ({
                    ...cfg,
                    snap: {...cfg.snap, disableAll: !cfg.snap.disableAll},
                }))
            }
            selected={!cfg.snap.disableAll}
            edxpandable={
                <div style={{display: "flex"}}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <SidebarButton
                            icon="GridViewMedium"
                            hover={"Whether to snap to major grid lines"}
                            title="Snap to major grid lines"
                            hoverDirection={DirectionalHint.topCenter}
                            onClick={() =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    snap: {
                                        ...cfg.snap,
                                        gridMajor: !cfg.snap.gridMajor,
                                    },
                                }))
                            }
                            selected={cfg.snap.gridMajor}
                        />
                        <Slider
                            min={0}
                            max={maxSnap}
                            styles={slideStyles}
                            step={1}
                            value={cfg.snapDistance.gridMajor}
                            onChange={val =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    snapDistance: {
                                        ...cfg.snapDistance,
                                        gridMajor: val,
                                    },
                                }))
                            }
                            vertical
                        />
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <SidebarButton
                            icon="GridViewSmall"
                            hover={"Whether to snap to minor grid lines"}
                            title="Snap to minor grid lines"
                            hoverDirection={DirectionalHint.topCenter}
                            onClick={() =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    snap: {
                                        ...cfg.snap,
                                        gridMajor: !cfg.snap.gridMajor,
                                    },
                                }))
                            }
                            selected={cfg.snap.gridMajor}
                        />
                        <Slider
                            min={0}
                            max={maxSnap}
                            styles={slideStyles}
                            step={1}
                            value={cfg.snapDistance.gridMinor}
                            onChange={val =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    snapDistance: {
                                        ...cfg.snapDistance,
                                        gridMinor: val,
                                    },
                                }))
                            }
                            vertical
                        />
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <SidebarButton
                            icon="LocationDot"
                            hover={"Whether to snap to previously defined points"}
                            title="Snap to points"
                            hoverDirection={DirectionalHint.topCenter}
                            onClick={() =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    snap: {...cfg.snap, points: !cfg.snap.points},
                                }))
                            }
                            selected={cfg.snap.points}
                        />
                        <Slider
                            min={0}
                            max={maxSnap}
                            styles={slideStyles}
                            step={1}
                            value={cfg.snapDistance.points}
                            onChange={val =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    snapDistance: {...cfg.snapDistance, points: val},
                                }))
                            }
                            vertical
                        />
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <SidebarButton
                            icon="Line"
                            hover={"Whether to snap to previously defined lines"}
                            title="Snap to lines"
                            hoverDirection={DirectionalHint.topCenter}
                            onClick={() =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    snap: {...cfg.snap, lines: !cfg.snap.lines},
                                }))
                            }
                            selected={cfg.snap.lines}
                        />
                        <Slider
                            min={0}
                            max={maxSnap}
                            styles={slideStyles}
                            step={1}
                            value={cfg.snapDistance.lines}
                            onChange={val =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    snapDistance: {...cfg.snapDistance, lines: val},
                                }))
                            }
                            vertical
                        />
                    </div>
                </div>
            }
        />
    );
};

const slideStyles = {
    container: {height: 100, width: 30},
    root: {marginRight: 0},
    valueLabel: {width: "auto"},
};
