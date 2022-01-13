import {loader} from "@monaco-editor/react";
import {languages, editor, Range} from "monaco-editor/esm/vs/editor/editor.api";

export const SATLanguage = "SAT";
export const SATTheme = "SAT";

languages.register({id: SATLanguage});

languages.setMonarchTokensProvider(SATLanguage, {
    tokenizer: {
        root: [
            [/(\(|\))+/, "bracket"],
            [/(\||\&|\!|\=|\<|\>)+/, "operator"],
            [/(\w|\d|-)+/, "variable"],
        ],
    },
});

// For whatever reason code folding isn't working, but I am just keeping this here in case (autocomplete also doesn't work, so it seems language services aren't working)
languages.registerFoldingRangeProvider(SATLanguage, {
    provideFoldingRanges: (model, context, token) => {
        const texts = model.getLinesContent();
        const matches: languages.FoldingRange[] = [];
        const stack: number[] = [];

        for (let j = 0; j < texts.length; j++) {
            const text = texts[j];
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char == "(") {
                    stack.push(j);
                } else if (char == ")") {
                    const last = stack.pop();
                    if (last == undefined || last == j) continue;
                    matches.push({
                        start: last + 1,
                        end: j + 1,
                    });
                }
            }
        }

        return matches;
    },
});

editor.defineTheme(SATTheme, {
    base: "vs",
    inherit: false,
    rules: [
        {token: "bracket", foreground: "000000"},
        {token: "operator", foreground: "2299cc", fontStyle: "bold"},
        {token: "variable", foreground: "497c9c"},
    ],
    colors: {},
});
