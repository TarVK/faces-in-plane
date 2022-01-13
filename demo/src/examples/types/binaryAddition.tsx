import {
    Dropdown,
    getTheme,
    Label,
    Stack,
    StackItem,
    TextField,
    Toggle,
} from "office-ui-fabric-react";
import React, {MutableRefObject, useCallback, useState} from "react";
import {InlineTex, Tex} from "react-tex";
import {genList} from "../../util/genList";
import {br} from "../latex";

const theme = getTheme();
export const binaryAddition = {
    name: "Binary addition",
    Comp: ({getCode}: {getCode: MutableRefObject<() => string>}) => {
        const [a, setA] = useState(4);
        const [b, setB] = useState(9);
        const [d, setD] = useState(13);
        const [generate, setGenerate] = useState<undefined | "b" | "d">(undefined);

        getCode.current = useCallback(() => {
            const aS = a.toString(2);
            const bS = b.toString(2);
            const dS = d.toString(2);
            const size =
                generate == "d"
                    ? Math.max(aS.length, bS.length) + 1
                    : generate == "b"
                    ? Math.max(aS.length, dS.length)
                    : Math.max(aS.length, bS.length, dS.length);

            const columnConstraints = `(\n${genList(
                size,
                i => `    (c${i} <=> a${i} <=> b${i} <=> d${i})`
            )
                .reverse()
                .join(" && \n")}\n)`;
            const rippleConstraints = `(\n${genList(
                {start: 1, end: size + 1},
                i =>
                    `    (c${i} <=> (a${i - 1} && c${i - 1}) || (b${i - 1} && c${
                        i - 1
                    }) || (a${i - 1} && b${i - 1}))`
            )
                .reverse()
                .join(" && \n")}\n) && !c0 && !c${size}`;

            const getNum = (name: string, val: string) =>
                [...val.padStart(size, "0")]
                    .reverse()
                    .map((char, i) => (char == "0" ? "!" : "") + name + i)
                    .reverse()
                    .join(" && ");

            const values = `(\n    (${getNum("a", aS)}) ${
                generate == "b" ? "" : `&&\n    (${getNum("b", bS)})`
            } ${generate == "d" ? "" : `&&\n    (${getNum("d", dS)})`}\n)`;
            return `${columnConstraints}\n&&\n${rippleConstraints}\n&&\n${values}`;
        }, [a, b, d, generate]);

        return (
            <>
                Computers represent numbers in binary. Each digit gets assigned the value
                1 or 0, or equivalently true or false. This means that computers add
                numbers using binary logic, and therefore it's a process we can also
                express in our satisfiability checker! <br />
                <br />
                <InlineTex
                    texContent={`
                    Let $$a$$, $$b$$ and $$d$$ be binary numbers, such that $$a + b = d$$. We can index these numbers to get a specific digit, E.g. $$a_i$$ is the $$i$$th digit (starting on the right at $$i=0$$) of $$a$$. ${br}
                    Let n be the maximum number of digits to represent any of the numbers $$a$$, $$b$$ and $$d$$. We can then define an additional number $$c$$ with one more digit, to represent the carry.                     
                `}
                />
                <br />
                <br />
                <img
                    src="addition.png"
                    style={{maxWidth: 300, maxHeight: 100, float: "right"}}
                />
                <InlineTex
                    texContent={`Now lets consider the example $$a=7, b=21$$ in decimal, or equivalently $$a=00111, b=10101$$ in binary. We can add these numbers together as you're used to from decimal, but carry when reaching 2 instead of when reaching 10 as illustrated by the image on the right.`}
                />
                <br />
                <br />
                <InlineTex
                    texContent={`
                    Now to formalize the logic a bit: ${br}
                    $$d_i$$ should be equal to $$a_i + b_i + c_i$$, however this may exceed 1, and each digit may only be 0 or 1. So if we exceed 1, we simply subtract 2 from the result and specify the carry of the next bit should be 1. ${br}
                    ${br}
                    It turns out that this is equivalent to defining $$d_i = a_i \\Leftrightarrow b_i \\Leftrightarrow c_i$$ (where $$\\Leftrightarrow$$ yields true if the left and right arguments are equivalent).
                    And stating that if any combination of digits in a column are both one, we should carry:   ${br}
                    $$c_{i+1} = (a_i \\land b_i) \\lor (a_i \\land c_i) \\lor (b_i \\land c_i)$$. ${br}
                    ${br}
                    Finally for all digits of all values we have to add a constraint to that digit, specifying E.g. $$a_i$$ if the digit should be 1, or $$\\neg a_i$$ if it should be zero. And we should make sure the first and last carries are 0. ${br}
                    ${br}
                    Putting this all together results in the following formula:${br}
                `}
                />
                <div style={{textAlign: "center"}}>
                    <InlineTex
                        texContent={`
                    $$\\bigwedge^{n-1}_{i=0} (d_i \\Leftrightarrow a_i \\Leftrightarrow b_i \\Leftrightarrow c_i)$$${br}
                    $$\\land $$${br}
                    $$!c_{n} \\land !c_0 \\land \\bigwedge^{n-1}_{i=0} (c_{i+1} \\Leftrightarrow (a_i \\land b_i) \\lor (a_i \\land c_i) \\lor (b_i \\land c_i))$$${br}
                    $$\\land $$${br}
                    $$\\bigwedge^{n-1}_{i=0} [\\neg] a_i \\land \\bigwedge^{n-1}_{i=0} [\\neg] b_i \\land \\bigwedge^{n-1}_{i=0} [\\neg] d_i$$${br}`}
                    />
                </div>
                <InlineTex
                    texContent={`The SAT-solver will determine whether $$a + b = d$$ holds for the assigned values. If any of the assignments of the 3 values is left out, the solver can calculate this remaining value, and thus perform addition or subtraction.`}
                />
                <Stack style={{marginTop: theme.spacing.l1}}>
                    <StackItem>
                        <Dropdown
                            placeholder="Select an option"
                            label="Solve output"
                            options={[
                                {
                                    key: "0",
                                    data: undefined,
                                    text: "None",
                                    selected: generate == undefined,
                                },
                                {
                                    key: "1",
                                    data: "b",
                                    text: "b",
                                    selected: generate == "b",
                                },
                                {
                                    key: "2",
                                    data: "d",
                                    text: "d",
                                    selected: generate == "d",
                                },
                            ]}
                            onChange={(e, option) => option && setGenerate(option.data)}
                        />
                    </StackItem>
                    <StackItem>
                        <Stack horizontal tokens={{childrenGap: theme.spacing.m}}>
                            <StackItem grow={1}>
                                <TextField
                                    type="number"
                                    value={a + ""}
                                    onChange={(e, v) => setA(Number(v))}
                                    label="Val a"
                                />
                            </StackItem>
                            <StackItem grow={1}>
                                <TextField
                                    disabled={generate == "b"}
                                    type="number"
                                    value={b + ""}
                                    onChange={(e, v) => setB(Number(v))}
                                    label="Val b"
                                />
                            </StackItem>
                            <StackItem grow={1}>
                                <TextField
                                    disabled={generate == "d"}
                                    type="number"
                                    value={d + ""}
                                    onChange={(e, v) => setD(Number(v))}
                                    label="Val d"
                                />
                            </StackItem>
                        </Stack>
                    </StackItem>
                </Stack>
            </>
        );
    },
};
