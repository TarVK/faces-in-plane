import {
    IconButton,
    ITooltipHostStyles,
    TooltipHost,
    DirectionalHint,
} from "@fluentui/react";
import {useId} from "@fluentui/react-hooks";
import React, {FC} from "react";
import {ISidebarButtonProps} from "./_types/ISidebarButtonProps";

const calloutProps = {gapSpace: 0};
const hostStyles: Partial<ITooltipHostStyles> = {root: {display: "inline-block"}};

export const SidebarButton: FC<ISidebarButtonProps> = ({
    icon,
    hover,
    title,
    onClick,
    selected,
}) => {
    const tooltipId = useId(icon);

    return (
        <TooltipHost
            content={hover}
            id={tooltipId}
            calloutProps={calloutProps}
            directionalHint={DirectionalHint.rightCenter}
            styles={hostStyles}>
            <IconButton
                iconProps={{iconName: icon}}
                ariaLabel={title}
                onClick={onClick}
                checked={selected}
            />
        </TooltipHost>
    );
};
