import {ReactNode} from "react";

export type ISidebarButtonProps = {
    icon: string;
    hover: string | JSX.Element | JSX.Element[];
    title: string;
    selected?: boolean;
    onClick: () => void;
};
