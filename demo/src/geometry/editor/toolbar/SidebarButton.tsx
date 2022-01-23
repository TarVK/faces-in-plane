import {
    IconButton,
    ITooltipHostStyles,
    TooltipHost,
    DirectionalHint,
    TooltipDelay,
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
    hoverDirection = DirectionalHint.topCenter,
}) => {
    const stringIcon = typeof icon == "string";
    const tooltipId = useId(stringIcon ? icon : title);

    return (
        <TooltipHost
            content={hover}
            id={tooltipId}
            calloutProps={calloutProps}
            delay={TooltipDelay.long}
            directionalHint={hoverDirection}
            styles={hostStyles}>
            <IconButton
                iconProps={stringIcon ? {iconName: icon} : undefined}
                onRenderIcon={stringIcon ? undefined : () => icon}
                ariaLabel={title}
                onClick={onClick}
                checked={selected}
            />
        </TooltipHost>
    );
};
