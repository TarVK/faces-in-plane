export function combineOptions(options: string[]): string {
    const last = options.pop();
    if (options.length == 0) return last ?? "";
    return options.join(", ") + " or " + last;
}
