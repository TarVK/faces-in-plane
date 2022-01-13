import {IFormula, IVariableCollection} from "SAT";

export function getResultVariables(
    formula: IFormula,
    solution: IVariableCollection
): Record<string, boolean> {
    const result = [...formula.toSMTLIB2().variables].map(v => [v.name, solution.get(v)]);
    return Object.fromEntries(result);
}
