import {
    getTheme,
    Label,
    Link,
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
export const pigeonHole = {
    name: "Pigeon Hole",
    Comp: ({getCode}: {getCode: MutableRefObject<() => string>}) => {
        const [n, setN] = useState(6);
        const [satisfiable, setSatisfiable] = useState(false);
        getCode.current = useCallback(() => {
            const Cn = `(\n${genList(
                n + 1,
                j => `    (${genList(n, i => `P${i + 1}-${j + 1}`).join(" || ")})`
            ).join(" && \n")}\n)`;
            const Rn = `(\n${genList(
                n,
                i =>
                    `    (\n${genList(
                        n,
                        j =>
                            `        (${genList(
                                {
                                    start:
                                        j + 1 + (satisfiable && i == 0 && j == 0 ? 1 : 0),
                                    end: n + 1,
                                },
                                k => `!(P${i + 1}-${j + 1} && P${i + 1}-${k + 1})`
                            ).join(" && ")})`
                    ).join(" && \n")}\n    )`
            ).join(" && \n")}\n)`;
            return `${Cn}\n&&\n${Rn}`;
        }, [n, satisfiable]);

        return (
            <>
                The{" "}
                <Link href="https://en.wikipedia.org/wiki/Pigeonhole_principle">
                    pigeon hole principle
                </Link>{" "}
                is a rudimentary counting principle used in many proofs. <br />
                This same principle can be expressed with a formula, and proving it to not
                be satisfiable. <br /> <br />
                <InlineTex
                    texContent={`
                    For an integer number $$n>0$$ we define a $$n \\cdot (n+1)$$ matrix. Every row represents a hole, and every column represents a pigeon. Each entry $$P_{ij}$$ states whether a pigeon $$j$$ is located in hole $$i$$. ${br}
                    ${br}
                    We define some constraints stating that every pigeon should be in a hole: ${br}
                    $$C_n = \\bigwedge^{n+1}_{j=1}(\\bigvee^{n}_{i=1}P_{ij}) $$ ${br}
                    And some constraints stating no two pigeons may be in one hole: ${br}
                    $$R_n = \\bigwedge^{n}_{i=1}(\\bigwedge_{1\\leq j < k \\leq n+1}\\neg (P_{ij} \\land P_{ik})) $$ ${br}
                    ${br}
                    Then if the pigeon hole principle is correct $$C_n \\land R_n$$ shouldn't be satisfiable for any $$n$$. However if the formula is relaxed in any way, the formula becomes satisfiable.
                    ${br}
                    ${br}
                    This formula is actually relatively hard to solve, so it's recommended you keep $$n$$ small, and use the CDCL solver. 
                `}
                />
                <br />
                <Stack
                    horizontal
                    tokens={{childrenGap: theme.spacing.m}}
                    style={{marginTop: theme.spacing.l1}}>
                    <StackItem>
                        <TextField
                            type="number"
                            value={n + ""}
                            onChange={(e, v) => setN(Number(v))}
                            label="Size n"
                        />
                    </StackItem>
                    <StackItem>
                        <Label>
                            <InlineTex texContent="Remove constraint $$\neg (P_{1\;1} \land P_{1\;2})$$" />
                        </Label>
                        <Toggle
                            inlineLabel
                            checked={satisfiable}
                            onChange={(e, v) => setSatisfiable(v ?? false)}
                        />
                    </StackItem>
                </Stack>
                {/* <Tex texContent="(3\times 4) \div (5-3)" /> */}
            </>
        );
    },
};
