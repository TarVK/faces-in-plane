import React, {FC, useEffect, useState} from "react";
import {GeometryEditorState} from "../GeometryEditorState";
import {SidebarButton} from "./SidebarButton";

export const EditorSettings: FC<{state: GeometryEditorState}> = () => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <SidebarButton
                icon="Settings"
                hover="Open settings"
                title="Open settings"
                onClick={() => setModalVisible(v => !v)}
            />
        </>
    );
};
