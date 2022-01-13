/**
 * Generates a list of the given size, filling items using the create function
 * @param size The size to be filled
 * @param create The function to generate items
 * @returns The creates list
 */
export const genList = <T>(
    size:
        | number
        | {
              /** Inclusive start number */
              start: number;
              /** Exclusive end number */
              end: number;
          },
    create: (i: number) => T
): T[] =>
    size instanceof Object
        ? new Array(size.end - size.start)
              .fill(null)
              .map((_, i) => create(i + size.start))
        : new Array(size).fill(null).map((_, i) => create(i));
