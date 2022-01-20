import React, {ReactNode} from "react";

export type IExpandableSidebarButtonProps = {
    icon: string | JSX.Element;
    hover: string | JSX.Element | JSX.Element[];
    title: string;
    selected?: boolean;
    onClick: () => void;
    edxpandable: ReactNode;
};
