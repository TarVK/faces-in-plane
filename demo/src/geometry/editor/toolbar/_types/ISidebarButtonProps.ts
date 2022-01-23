import {DirectionalHint} from "@fluentui/react";
import {ReactNode} from "react";

export type ISidebarButtonProps = {
    icon: string | JSX.Element;
    hover: string | JSX.Element | JSX.Element[];
    title: string;
    selected?: boolean;
    hoverDirection?: DirectionalHint;
    onClick: () => void;
};
