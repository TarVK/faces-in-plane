"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = exports.getSeededRandom = void 0;
/**
 * Creates a seeded random function, based on mulberry32: https://stackoverflow.com/a/47593316/8521718
 * @param seed The seed for the random number generator
 * @returns The random number generator
 */
function getSeededRandom(seed) {
    return () => {
        var t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
exports.getSeededRandom = getSeededRandom;
/**
 * Shuffles the given array in place
 * @param array The array to be shuffled
 * @param seed The random seed to perform the shuffling with
 * @returns A reference to the shuffled array
 * @remark
 * Based on: https://stackoverflow.com/a/2450976/8521718
 */
function shuffle(array, seed) {
    const random = getSeededRandom(seed !== null && seed !== void 0 ? seed : 0);
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}
exports.shuffle = shuffle;
//# sourceMappingURL=shuffle.js.map