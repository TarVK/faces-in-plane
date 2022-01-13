import React, {FC, Fragment, useState} from "react";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import ReactJson from "react-json-view";
import {DavisPutnamSolver, DPLLSolver, CDCLSolver, ISATSolver} from "SAT";
import {ISolveResult} from "./_types/ISolveResult";
import {formatTime} from "./util/formatTime";

const theme = getTheme();
const solvers = [DavisPutnamSolver, DPLLSolver, CDCLSolver];
export const Sidebar: FC<{
    onSolve: (solver: ISATSolver) => void;
    result?: ISolveResult;
}> = ({onSolve, result}) => {
    const [solverId, setSolverId] = useState(2);

    const evaluationTime = result && formatTime(result.duration);
    return (
        <Stack style={{maxHeight: "100%"}}>
            <StackItem>
                <Dropdown
                    placeholder="Select an option"
                    label="Solver"
                    options={[
                        {
                            key: "0",
                            data: 0,
                            text: "DavisPutnam",
                            selected: solverId == 0,
                        },
                        {
                            key: "1",
                            data: 1,
                            text: "DPLL",
                            selected: solverId == 1,
                        },
                        {
                            key: "2",
                            data: 2,
                            text: "CDCL",
                            selected: solverId == 2,
                        },
                    ]}
                    onChange={(e, option) => option && setSolverId(option.data)}
                />
            </StackItem>
            <StackItem>
                <PrimaryButton
                    text="Solve"
                    onClick={() => onSolve(solvers[solverId])}
                    allowDisabledFocus
                    styles={{
                        root: {
                            width: "100%",
                            marginTop: theme.spacing.m,
                            marginBottom: theme.spacing.m,
                        },
                    }}
                />
            </StackItem>
            {result && (
                <Fragment>
                    <StackItem shrink={1} style={{minHeight: 0, overflow: "auto"}}>
                        {"solution" in result ? (
                            <ReactJson
                                src={result.solution}
                                name={"solution"}
                                displayDataTypes={false}
                                quotesOnKeys={false}
                                displayObjectSize={false}
                                sortKeys={true}
                            />
                        ) : "error" in result ? (
                            <div style={{color: "rgb(175 20 20)"}}>
                                {result.error.message}
                            </div>
                        ) : (
                            "Formula is not satisfiable"
                        )}
                    </StackItem>

                    <StackItem>
                        <div style={{marginTop: theme.spacing.m}}>
                            Evaluated in{" "}
                            <span style={{color: theme.palette.accent}}>
                                {evaluationTime!.value}
                            </span>
                            {evaluationTime!.unit}
                        </div>
                    </StackItem>
                </Fragment>
            )}
        </Stack>
    );
};
