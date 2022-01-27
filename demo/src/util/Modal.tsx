import {
    FontWeights,
    getTheme,
    IButtonStyles,
    IconButton,
    IIconProps,
    mergeStyleSets,
    Modal,
} from "@fluentui/react";
import {useId} from "@fluentui/react-hooks";
import React, {FC} from "react";

export const StandardModal: FC<{
    title: string;
    visible: boolean;
    onClose: () => void;
}> = ({title, visible, onClose, children}) => {
    const titleId = useId("title");

    return (
        <>
            <Modal
                titleAriaId={titleId}
                isOpen={visible}
                onDismiss={onClose}
                layerProps={{eventBubblingEnabled: true}}
                containerClassName={contentStyles.container}>
                <div className={contentStyles.header}>
                    <span id={titleId}>{title}</span>
                    <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={onClose}
                    />
                </div>
                <div className={contentStyles.body}>{children}</div>
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
        maxWidth: 700,
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
