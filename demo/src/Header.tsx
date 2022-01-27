import {Stack, StackItem, getTheme, Link, CommandBarButton} from "office-ui-fabric-react";
import {FontIcon} from "@fluentui/react";
import React, {FC, useState} from "react";
import {StandardModal} from "./util/Modal";

const theme = getTheme();
export const Header: FC<{info?: React.ReactNode}> = ({children, info}) => {
    const [showInfo, setShowInfo] = useState(true);
    return (
        <Stack
            horizontal
            horizontalAlign="space-between"
            styles={{
                root: {
                    boxShadow: theme.effects.elevation16,
                    zIndex: 100,
                    background: "white",
                    position: "relative",
                },
            }}>
            <StackItem
                align="center"
                style={{
                    paddingLeft: theme.spacing.m,
                    width: 300,
                    boxSizing: "border-box",
                }}>
                <h1 style={{margin: 0}}>Polygon combiner</h1>
            </StackItem>
            <StackItem align="center">{children}</StackItem>
            <StackItem align="center" style={{width: 300}}>
                <Stack
                    horizontal
                    style={{justifyContent: "end"}}
                    horizontalAlign="space-between">
                    {info && (
                        <StackItem align="stretch">
                            <StandardModal
                                title="Info"
                                visible={showInfo}
                                onClose={() => setShowInfo(false)}>
                                {info}
                            </StandardModal>
                            <CommandBarButton
                                onClick={() => setShowInfo(true)}
                                styles={{root: {height: "100%"}}}>
                                <FontIcon
                                    aria-label="Deselect"
                                    iconName="StatusCircleQuestionMark"
                                    style={{fontSize: 25}}
                                />
                            </CommandBarButton>
                        </StackItem>
                    )}
                    <StackItem align="center">
                        <Link href="https://github.com/TarVK/SAT">
                            <CommandBarButton
                                styles={{root: {padding: theme.spacing.l1}}}>
                                Github
                            </CommandBarButton>
                        </Link>
                    </StackItem>
                </Stack>
            </StackItem>
        </Stack>
    );
};
