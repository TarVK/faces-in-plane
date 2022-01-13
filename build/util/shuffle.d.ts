/**
 * Creates a seeded random function, based on mulberry32: https://stackoverflow.com/a/47593316/8521718
 * @param seed The seed for the random number generator
 * @returns The random number generator
 */
export declare function getSeededRandom(seed: number): () => number;
/**
 * Shuffles the given array in place
 * @param array The array to be shuffled
 * @param seed The random seed to perform the shuffling with
 * @returns A reference to the shuffled array
 * @remark
 * Based on: https://stackoverflow.com/a/2450976/8521718
 */
export declare function shuffle<T>(array: T[], seed?: number): T[];
//# sourceMappingURL=shuffle.d.ts.map