import {getTheme} from "@fluentui/react";
import {useDataHook} from "model-react";
import React, {FC} from "react";
import {GeometryEditorState} from "../GeometryEditorState";
import {SidebarButton} from "./SidebarButton";

export const EditorSidebar: FC<{state: GeometryEditorState}> = ({state}) => {
    const [h] = useDataHook();
    return (
        <div
            style={{
                boxShadow: "rgb(0 0 0 / 25%) 3px -2px 10px 0px",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
            }}>
            <SidebarButton
                icon="AddFavorite"
                hover={"Add new polygons and points"}
                title="Add polygons"
                onClick={() => state.setSelectedTool("create")}
                selected={state.getSelectedTool(h) == "create"}
            />
            <SidebarButton
                icon="Edit"
                hover={"Edit existing polygons and points"}
                title="Edit polygons"
                onClick={() => state.setSelectedTool("edit")}
                selected={state.getSelectedTool(h) == "edit"}
            />
        </div>
    );
};
