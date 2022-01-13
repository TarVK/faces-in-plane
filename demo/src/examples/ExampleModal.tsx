import {
    DefaultButton,
    getTheme,
    Modal,
    Pivot,
    PivotItem,
    PrimaryButton,
    Stack,
    StackItem,
} from "office-ui-fabric-react";
import React, {FC, useRef, useState} from "react";
import {binaryAddition} from "./types/binaryAddition";
import {pigeonHole} from "./types/pigeonHole";

const examples = [binaryAddition, pigeonHole];
const theme = getTheme();
export const ExampleModal: FC<{onLoad: (example: string) => void}> = ({onLoad}) => {
    const [visible, setVisible] = useState(false);
    const getCode = useRef(() => "");

    return (
        <>
            <DefaultButton onClick={() => setVisible(true)} text="Load example" />
            <Modal
                titleAriaId="Choose example"
                isOpen={visible}
                onDismiss={() => setVisible(false)}
                isBlocking={false}
                styles={{main: {overflow: "hidden"}}}>
                <Stack
                    style={{
                        minHeight: 200,
                        width: 800,
                        maxWidth: "100%",
                    }}>
                    <StackItem grow={1}>
                        <Pivot
                            aria-label="Example choice"
                            styles={{
                                itemContainer: {
                                    maxHeight: "calc(100vh - 150px)",
                                    overflow: "auto",
                                    fontSize: 13,
                                },
                            }}>
                            {examples.map(({name, Comp}, i) => (
                                <PivotItem
                                    headerText={name}
                                    key={i}
                                    itemKey={i + ""}
                                    style={{padding: theme.spacing.m}}>
                                    <Comp getCode={getCode} />
                                </PivotItem>
                            ))}
                        </Pivot>
                    </StackItem>

                    <StackItem>
                        <Stack
                            horizontal
                            gap={10}
                            style={{padding: theme.spacing.m}}
                            horizontalAlign="end">
                            <StackItem>
                                <DefaultButton
                                    onClick={() => setVisible(false)}
                                    text="Cancel"
                                />
                            </StackItem>
                            <StackItem>
                                <PrimaryButton
                                    onClick={() => {
                                        setVisible(false);
                                        onLoad(getCode.current());
                                    }}
                                    text="Load"
                                />
                            </StackItem>
                        </Stack>
                    </StackItem>
                </Stack>
            </Modal>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css"
            />
        </>
    );
};
