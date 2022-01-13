import {Stack, StackItem, getTheme, Link, CommandBarButton} from "office-ui-fabric-react";
import React, {FC} from "react";

const theme = getTheme();
export const Header: FC = ({children}) => (
    <Stack
        horizontal
        horizontalAlign="space-between"
        styles={{
            root: {
                boxShadow: theme.effects.elevation16,
                paddingLeft: theme.spacing.m,
                marginBottom: theme.spacing.s1,
                zIndex: 100,
                position: "relative",
            },
        }}>
        <StackItem align="center">
            <h1 style={{margin: 0}}>SAT-solver</h1>
        </StackItem>
        <StackItem align="center">{children}</StackItem>
        <StackItem align="center">
            <Link href="https://github.com/TarVK/SAT">
                <CommandBarButton styles={{root: {padding: theme.spacing.l1}}}>
                    Github
                </CommandBarButton>
            </Link>
        </StackItem>
    </Stack>
);
