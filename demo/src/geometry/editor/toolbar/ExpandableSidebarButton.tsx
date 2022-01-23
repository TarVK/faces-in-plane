import {
    IconButton,
    ITooltipHostStyles,
    TooltipHost,
    DirectionalHint,
    mergeStyles,
    TooltipDelay,
} from "@fluentui/react";
import {useId} from "@fluentui/react-hooks";
import React, {FC} from "react";
import {IExpandableSidebarButtonProps} from "./_types/IExpandableSidebarButtonProps";
import {ISidebarButtonProps} from "./_types/ISidebarButtonProps";

const calloutProps = {gapSpace: 0};
const hostStyles: Partial<ITooltipHostStyles> = {root: {display: "inline-block"}};

export const ExpandableSidebarButton: FC<IExpandableSidebarButtonProps> = ({
    icon,
    hover,
    title,
    onClick,
    selected,
    edxpandable,
}) => {
    const stringIcon = typeof icon == "string";
    const tooltipId = useId(stringIcon ? icon : title);

    return (
        <TooltipHost
            content={hover}
            id={tooltipId}
            calloutProps={calloutProps}
            directionalHint={DirectionalHint.topLeftEdge}
            delay={TooltipDelay.long}
            styles={hostStyles}>
            <div className={style}>
                <div
                    className="extending"
                    style={{
                        position: "absolute",
                        top: "100%",
                        backgroundColor: "white",
                        boxShadow: "rgb(0 0 0 / 25%) 0px 4px 10px 0px",
                    }}>
                    {edxpandable}
                </div>
                <IconButton
                    iconProps={stringIcon ? {iconName: icon} : undefined}
                    onRenderIcon={stringIcon ? undefined : () => icon}
                    ariaLabel={title}
                    onClick={onClick}
                    checked={selected}
                />
            </div>
        </TooltipHost>
    );
};

const style = mergeStyles({
    ":hover": {
        boxShadow: "rgb(0 0 0 / 25%) 0px 3px 10px 0px",
        zIndex: 1000,
        position: "relative",
        ".extending": {
            display: "block",
        },
    },
    ".extending": {
        display: "none",
    },
});
