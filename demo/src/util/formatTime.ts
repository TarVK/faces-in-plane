/**
 * Converts the given number of milliseconds into an easy to read form
 * @param millis The number of milliseconds
 * @returns The new value, as well as its unit
 */
export function formatTime(millis: number): {value: number; unit: string} {
    const conversion = [
        [1000, "s"],
        [60, "m"],
        [60, "h"],
        [24, "d"],
    ] as [number, string][];
    let value = millis;
    let unit = "ms";
    while (conversion.length) {
        const [divisor, newUnit] = conversion.shift()!;
        let newVal = value / divisor;
        if (newVal < 1) break;
        value = newVal;
        unit = newUnit;
    }

    return {value, unit};
}
