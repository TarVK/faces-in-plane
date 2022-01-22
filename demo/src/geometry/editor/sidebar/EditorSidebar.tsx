import {DirectionalHint, FontIcon, getTheme, Slider} from "@fluentui/react";
import {Field, useDataHook} from "model-react";
import {config} from "process";
import React, {FC, useCallback} from "react";
import {GeometryEditorState} from "../GeometryEditorState";
import {IEditorConfig} from "../_types/IEditorConfig";
import {EditorSettings} from "./EditorSettings";
import {ExpandableSidebarButton} from "./ExpandableSidebarButton";
import {SidebarButton} from "./SidebarButton";
import {SnapControls} from "./SnapControls";

export const EditorSidebar: FC<{
    state: GeometryEditorState;
    readonly?: boolean;
}> = ({state, readonly}) => {
    const [h] = useDataHook();
    const updateConfig = useCallback(
        (getNewConfig: (cfg: IEditorConfig) => IEditorConfig) => {
            const config = state.getConfig();
            state.setConfig(getNewConfig(config));
        },
        [state]
    );

    const cfg = state.getConfig(h);
    return (
        <div
            style={{
                boxShadow: "rgb(0 0 0 / 25%) 3px 0px 10px 0px",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
            }}>
            <SidebarButton
                icon="AddFavorite"
                hover={"Add new polygons and points (T)"}
                title="Add polygons"
                onClick={() => state.setSelectedTool("create")}
                selected={state.getSelectedTool(h) == "create"}
            />
            <SidebarButton
                icon="Edit"
                hover={"Edit existing polygons and points (T)"}
                title="Edit polygons"
                onClick={() => state.setSelectedTool("edit")}
                selected={state.getSelectedTool(h) == "edit"}
            />

            {/* Actions */}
            <div style={{height: 50}} />
            <SidebarButton
                icon={
                    <>
                        <FontIcon aria-label="Polygon" iconName="TriangleShape" />
                        <FontIcon
                            aria-label="Deselect"
                            iconName="Cancel"
                            style={{fontSize: 10, marginTop: 5}}
                        />
                    </>
                }
                hover={"Deselect the selected polygon (Escape)"}
                title="Deselect polygon"
                onClick={() => state.deselectPolygon()}
            />
            <SidebarButton
                icon={
                    <>
                        <FontIcon aria-label="Point" iconName="LocationDot" />
                        <FontIcon
                            aria-label="Deselect"
                            iconName="Cancel"
                            style={{fontSize: 10, marginTop: 5}}
                        />
                    </>
                }
                hover={"Deselect the selected point"}
                title="Deselect point"
                onClick={() => state.deselectPoint()}
            />
            {!readonly && (
                <>
                    <SidebarButton
                        icon={
                            <>
                                <FontIcon aria-label="Polygon" iconName="TriangleShape" />
                                <FontIcon
                                    aria-label="Delete"
                                    iconName="Delete"
                                    style={{fontSize: 10, marginTop: 5}}
                                />
                            </>
                        }
                        hover={"Delete the selected polygon (D)"}
                        title="Delete polygon"
                        onClick={() => state.deletePolygon()}
                    />
                    <SidebarButton
                        icon={
                            <>
                                <FontIcon aria-label="Point" iconName="LocationDot" />
                                <FontIcon
                                    aria-label="Delete"
                                    iconName="Delete"
                                    style={{fontSize: 10, marginTop: 5}}
                                />
                            </>
                        }
                        hover={"Delete the selected point (D)"}
                        title="Delete polygon"
                        onClick={() => state.deletePoint()}
                    />
                </>
            )}

            {/* Extra settings */}
            <div style={{height: 50}} />
            <SidebarButton
                icon="Code"
                hover="Show json editor"
                title="Show json editor"
                onClick={() => state.setCodeEditorVisible(!state.isCodeEditorVisible())}
                selected={state.isCodeEditorVisible(h)}
            />
            <SnapControls state={state} />
            <SidebarButton
                icon={
                    {
                        none: "GridViewLarge",
                        major: "GridViewMedium",
                        minor: "GridViewSmall",
                    }[cfg.grid]
                }
                hover="Grid display options"
                title="Grid display"
                onClick={() => {
                    const options = ["none", "major", "minor"] as const;
                    const index = options.indexOf(cfg.grid);
                    updateConfig(cfg => ({
                        ...cfg,
                        grid: options[(index + 1) % options.length],
                    }));
                }}
                selected={cfg.grid != "none"}
            />
            <SidebarButton
                icon="Add"
                hover="Show axis"
                title="Show axis"
                onClick={() => updateConfig(cfg => ({...cfg, showAxis: !cfg.showAxis}))}
                selected={cfg.showAxis}
            />
            <EditorSettings state={state} />
        </div>
    );
};
