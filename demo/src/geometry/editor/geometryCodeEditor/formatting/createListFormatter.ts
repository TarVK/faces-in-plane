import {IFormatter} from "./_types/IFormatter";

// Pretty messy, but does the job (I think?)
/**
 * Creates a new formatter to format lists of data
 * @param config The configuration for the formatter
 * @returns The created formatter
 */
export const createListFormatter =
    ({
        openBracket,
        closeBracket,
        separator,
        items,
    }: {
        openBracket: string;
        closeBracket: string;
        separator: string;
        items: IFormatter[];
    }): IFormatter =>
    (options, [firstML, middleML, lastML]) => {
        const {indentation} = options;
        const itemResults: string[] = [];

        // Try to fit everything on a single line
        singleLine: {
            const noWrapSeparator = separator + " ";

            let charactersLeft =
                Math.min(firstML, middleML, lastML) -
                openBracket.length -
                closeBracket.length;
            for (let i = 0; i < items.length; i++) {
                const format = items[i];
                if (i != 0) charactersLeft -= noWrapSeparator.length;
                if (charactersLeft < 0) break singleLine;

                const newLines = format(options, [
                    charactersLeft,
                    charactersLeft,
                    charactersLeft,
                ]);

                const singleLine = newLines.length <= 1;
                if (!singleLine) break singleLine;
                if (newLines.length == 0) continue;

                const line = newLines[0];
                itemResults.push(line);
                charactersLeft -= line.length;

                if (charactersLeft < 0) break singleLine;
            }

            return [openBracket + itemResults.join(noWrapSeparator) + closeBracket];
        }

        // Create multiple lines if it doesn't fit
        let firstInvalid = itemResults.findIndex(
            line => line.length + indentation.length > middleML
        );
        if (firstInvalid == -1) firstInvalid = itemResults.length;

        const lines = [
            openBracket,
            ...itemResults
                .slice(0, firstInvalid)
                .map(
                    (line, i) =>
                        indentation + line + (i + 1 < items.length ? separator : "")
                ),
        ];

        const indentedMiddleML = middleML - indentation.length;
        for (let i = firstInvalid; i < items.length; i++) {
            const format = items[i];

            const lengths = [
                indentedMiddleML,
                indentedMiddleML,
                indentedMiddleML - (i + 1 == items.length ? 0 : separator.length),
            ] as [number, number, number];
            const newLines = format(options, lengths);

            if (i + 1 == items.length) {
                if (newLines.length > 0)
                    lines.push(...newLines.map(line => indentation + line));
            } else {
                if (newLines.length > 0)
                    lines.push(
                        ...newLines.slice(0, -1).map(line => indentation + line),
                        indentation + newLines[newLines.length - 1] + separator
                    );
            }
        }

        lines.push(closeBracket);
        return lines;
    };
