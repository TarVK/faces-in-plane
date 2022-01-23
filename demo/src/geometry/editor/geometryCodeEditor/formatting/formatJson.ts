import {IJSON} from "../_types/IJSON";
import {createListFormatter} from "./createListFormatter";
import {IFormatOptions} from "./_types/IFormatOptions";
import {IFormatter} from "./_types/IFormatter";

/**
 * Formats the given json data
 * @param data The data to format
 * @param options The formatting options
 * @returns The formatted string
 */
export function formatJson(data: IJSON, options: IFormatOptions = {}): string {
    const format = createJSONFormatter(data);

    const config = {
        indentation: "    ",
        maxWidth: 1000,
        ...options,
    };
    const lines = format(config, [config.maxWidth, config.maxWidth, config.maxWidth]);
    return lines.join("\n");
}

/**
 * Retrieves the hierarhical textual content of the given JSON
 * @param data The json data to extract the content from
 */
export function createJSONFormatter(data: IJSON): IFormatter {
    if (data instanceof Array) {
        return createListFormatter({
            openBracket: "[",
            closeBracket: "]",
            separator: ",",
            items: data.map(item => createJSONFormatter(item)),
        });
    } else if (data instanceof Object) {
        const itemFormatters = Object.values(data).map(item => createJSONFormatter(item));
        return createListFormatter({
            openBracket: "{",
            closeBracket: "}",
            separator: ",",
            items: Object.keys(data).map(
                (key, index) =>
                    (options, [firstML, middleML, lastML]) => {
                        const prefix = '"' + key + '": ';
                        const lines = itemFormatters[index](options, [
                            firstML - prefix.length,
                            middleML,
                            lastML,
                        ]);
                        return [prefix + (lines[0] ?? ""), ...lines.slice(1)];
                    }
            ),
        });
    } else {
        return () => [JSON.stringify(data)];
    }
}
