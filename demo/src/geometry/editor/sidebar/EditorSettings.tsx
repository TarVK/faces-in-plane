import {
    DirectionalHint,
    FontWeights,
    getTheme,
    IButtonStyles,
    IconButton,
    IIconProps,
    ITooltipHostStyles,
    Label,
    mergeStyleSets,
    Modal,
    Slider,
    TooltipDelay,
    TooltipHost,
} from "@fluentui/react";
import {useId} from "@fluentui/react-hooks";
import {useDataHook} from "model-react";
import React, {FC, useCallback, useState} from "react";
import {GeometryEditorState} from "../GeometryEditorState";
import {IEditorConfig} from "../_types/IEditorConfig";
import {ColorInput} from "./ColorInput";
import {SidebarButton} from "./SidebarButton";

export const EditorSettings: FC<{state: GeometryEditorState}> = ({state}) => {
    const titleId = useId("title");
    const [modalVisible, setModalVisible] = useState(false);
    const updateConfig = useCallback(
        (getNewConfig: (cfg: IEditorConfig) => IEditorConfig) => {
            const config = state.getConfig();
            state.setConfig(getNewConfig(config));
        },
        [state]
    );

    const [h] = useDataHook();
    const cfg = state.getConfig(h);
    return (
        <>
            <SidebarButton
                icon="Settings"
                hover="Open settings"
                title="Open settings"
                onClick={() => setModalVisible(v => !v)}
            />
            <Modal
                titleAriaId={titleId}
                isOpen={modalVisible}
                onDismiss={() => setModalVisible(false)}
                layerProps={{eventBubblingEnabled: true}}
                containerClassName={contentStyles.container}>
                <div className={contentStyles.header}>
                    <span id={titleId}>Editor settings</span>
                    <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={() => setModalVisible(false)}
                    />
                </div>
                <div className={contentStyles.body}>
                    <TooltipHost
                        content="Edit default edge color and size"
                        id={useId("edge")}
                        calloutProps={calloutProps}
                        delay={TooltipDelay.long}
                        directionalHint={DirectionalHint.topCenter}
                        styles={hostStyles}>
                        <Label>Default polygon edge style</Label>
                    </TooltipHost>
                    <div style={{display: "flex"}}>
                        <ColorInput
                            value={cfg.polygonEdgeColor}
                            opacity={cfg.polygonEdgeOpacity}
                            onChange={(color, opacity) =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    polygonEdgeColor: color,
                                    polygonEdgeOpacity: opacity,
                                }))
                            }
                        />
                        <Slider
                            styles={{root: {flexGrow: 1}}}
                            min={0}
                            max={10}
                            step={1}
                            value={cfg.polygonEdgeSize}
                            onChange={value =>
                                updateConfig(cfg => ({...cfg, polygonEdgeSize: value}))
                            }
                            showValue
                            snapToStep
                        />
                    </div>
                    <TooltipHost
                        content="Edit default point color and size"
                        id={useId("point")}
                        calloutProps={calloutProps}
                        delay={TooltipDelay.long}
                        directionalHint={DirectionalHint.topCenter}
                        styles={hostStyles}>
                        <Label>Default polygon point style</Label>
                    </TooltipHost>
                    <div style={{display: "flex"}}>
                        <ColorInput
                            value={cfg.polygonPointColor}
                            opacity={cfg.polygonPointOpacity}
                            onChange={(color, opacity) =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    polygonPointColor: color,
                                    polygonPointOpacity: opacity,
                                }))
                            }
                        />
                        <Slider
                            styles={{root: {flexGrow: 1}}}
                            min={0}
                            max={20}
                            step={1}
                            value={cfg.polygonPointSize}
                            onChange={value =>
                                updateConfig(cfg => ({...cfg, polygonPointSize: value}))
                            }
                            showValue
                            snapToStep
                        />
                    </div>
                    <TooltipHost
                        content="Edit default polygon color"
                        id={useId("point")}
                        calloutProps={calloutProps}
                        delay={TooltipDelay.long}
                        directionalHint={DirectionalHint.topCenter}
                        styles={hostStyles}>
                        <Label>Default polygon style</Label>
                    </TooltipHost>
                    <div style={{display: "flex"}}>
                        <ColorInput
                            value={cfg.polygonColor}
                            opacity={cfg.polygonOpacity}
                            onChange={(color, opacity) =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    polygonColor: color,
                                    polygonOpacity: opacity,
                                }))
                            }
                        />
                    </div>

                    <div style={{height: 50}} />
                    <TooltipHost
                        content="Edit selected point size and opacity"
                        id={useId("point")}
                        calloutProps={calloutProps}
                        delay={TooltipDelay.long}
                        directionalHint={DirectionalHint.topCenter}
                        styles={hostStyles}>
                        <Label>Selected point size and opacity</Label>
                    </TooltipHost>
                    <div style={{display: "flex"}}>
                        <Slider
                            styles={{root: {flexGrow: 1}}}
                            min={0}
                            max={20}
                            step={1}
                            value={cfg.polygonPointSelectSize}
                            onChange={value =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    polygonPointSelectSize: value,
                                }))
                            }
                            showValue
                            snapToStep
                        />
                        <Slider
                            styles={{root: {flexGrow: 1}}}
                            min={0}
                            max={1}
                            step={0.05}
                            value={cfg.polygonPointSelectOpacity}
                            onChange={value =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    polygonPointSelectOpacity: value,
                                }))
                            }
                            showValue
                            snapToStep
                        />
                    </div>
                    <TooltipHost
                        content="Edit selected polygon opacity"
                        id={useId("point")}
                        calloutProps={calloutProps}
                        delay={TooltipDelay.long}
                        directionalHint={DirectionalHint.topCenter}
                        styles={hostStyles}>
                        <Label>Selected polygon opacity</Label>
                    </TooltipHost>
                    <div style={{display: "flex"}}>
                        <Slider
                            styles={{root: {flexGrow: 1}}}
                            min={0}
                            max={1}
                            step={0.05}
                            value={cfg.polygonSelectOpacity}
                            onChange={value =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    polygonSelectOpacity: value,
                                }))
                            }
                            showValue
                            snapToStep
                        />
                    </div>

                    <div style={{height: 50}} />
                    <TooltipHost
                        content="Edit zoom speed"
                        id={useId("point")}
                        calloutProps={calloutProps}
                        delay={TooltipDelay.long}
                        directionalHint={DirectionalHint.topCenter}
                        styles={hostStyles}>
                        <Label>Zoom sensitivity</Label>
                    </TooltipHost>
                    <div style={{display: "flex"}}>
                        <Slider
                            styles={{root: {flexGrow: 1}}}
                            min={0.01}
                            max={0.2}
                            step={0.01}
                            value={cfg.zoomSpeed}
                            onChange={value =>
                                updateConfig(cfg => ({
                                    ...cfg,
                                    zoomSpeed: value,
                                }))
                            }
                            showValue
                            snapToStep
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

const cancelIcon: IIconProps = {iconName: "Cancel"};
const theme = getTheme();
const contentStyles = mergeStyleSets({
    container: {
        display: "flex",
        flexFlow: "column nowrap",
        alignItems: "stretch",
    },
    header: [
        // eslint-disable-next-line deprecation/deprecation
        theme.fonts.xLargePlus,
        {
            flex: "1 1 auto",
            borderTop: `4px solid ${theme.palette.themePrimary}`,
            color: theme.palette.neutralPrimary,
            display: "flex",
            alignItems: "center",
            fontWeight: FontWeights.semibold,
            padding: "12px 12px 14px 24px",
        },
    ],
    body: {
        flex: "4 4 auto",
        padding: "0 24px 24px 24px",
        overflowY: "hidden",
        selectors: {
            p: {margin: "14px 0"},
            "p:first-child": {marginTop: 0},
            "p:last-child": {marginBottom: 0},
        },
    },
});
const iconButtonStyles: Partial<IButtonStyles> = {
    root: {
        color: theme.palette.neutralPrimary,
        marginLeft: "auto",
        marginTop: "4px",
        marginRight: "2px",
    },
    rootHovered: {
        color: theme.palette.neutralDark,
    },
};

const calloutProps = {gapSpace: 0};
const hostStyles: Partial<ITooltipHostStyles> = {root: {display: "inline-block"}};
