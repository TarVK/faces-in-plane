import {BalancedSearchTree} from "../BalancedSearchTree";
import {shuffle} from "./shuffle.helper";

describe("BalancedSearchTree", () => {
    describe("Insert / Search", () => {
        it("Should handle any order of inserts", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);

            const vals = [3, 6, 2, 7, 13, 45, 23, 57, 33, 19, 8, 1, 34, 12, 28];
            vals.forEach(val => tree.insert(val));
            4;
            expect(tree.find(57)).toBe(57);
            expect(tree.find(14)).toBe(undefined);
            expect(tree.find(p => 57 - p)).toBe(57);
        });
        it("Should remain balanced", () => {
            const count = 1000;

            let tree = new BalancedSearchTree<number>((a, b) => a - b);
            let vals = new Array(count).fill(0).map((_, i) => i);
            vals.forEach(val => tree.insert(val));
            expect((tree as any).root.height).toBeLessThan(Math.log2(vals.length) * 2);

            tree = new BalancedSearchTree<number>((a, b) => a - b);
            vals = new Array(count).fill(0).map((_, i) => count - i);
            vals.forEach(val => tree.insert(val));
            expect((tree as any).root.height).toBeLessThan(Math.log2(vals.length) * 2);
        });
        it("Should handle duplicates", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            expect(tree.find(24)).toBe(undefined);

            const vals = [10, 11, 12, 13, 14, 15, 10, 11, 12, 13];
            vals.forEach(val => tree.insert(val));
            expect(tree.find(10)).toBe(10);
            expect(tree.find(20)).toBe(undefined);
            expect(tree.find(p => 12 - p)).toBe(12);
        });
    });
    describe("Delete", () => {
        it("Should handle any order of deletions", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);

            const vals = [3, 6, 2, 7, 13, 45, 23, 57, 33, 19, 8, 1, 34, 12, 28];
            vals.forEach(val => tree.insert(val));

            const rem = [13, 45, 12, 28, 33, 19];
            rem.forEach(val => tree.delete(val));

            expect(tree.find(57)).toBe(57);
            expect(tree.find(45)).toBe(undefined);
            expect(tree.find(p => 28 - p)).toBe(undefined);
        });
        for (const ins of ["incr", "decr"])
            for (const del of ["incr", "decr"])
                for (const type of ["module", "half"]) {
                    it(`Should remain balanced (ins;${ins} del;${del} type;${type})`, () => {
                        const count = 1000;
                        let tree = new BalancedSearchTree<number>((a, b) => a - b);
                        let vals = new Array(count)
                            .fill(0)
                            .map((_, i) => (ins == "incr" ? i : count - i));
                        vals.forEach(val => tree.insert(val));

                        let dels =
                            type == "modulo"
                                ? vals.filter((v, i) => i % 3 == 0)
                                : vals.slice(vals.length / 2);
                        if (ins != del) dels.reverse();
                        dels.forEach(val => tree.delete(val));

                        expect((tree as any).root.height).toBeLessThan(
                            Math.log2(vals.length - dels.length) * 2
                        );
                    });
                }
        it("Should handle duplicates", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);

            const vals = [
                3, 6, 2, 7, 13, 45, 23, 57, 33, 19, 8, 1, 34, 12, 28, /** dup */ 7, 23,
                23,
            ];
            vals.forEach(val => tree.insert(val));

            tree.delete(7);
            expect(tree.find(7)).toBe(7);

            tree.delete(23);
            tree.delete(7);
            expect(tree.find(7)).toBe(undefined);

            expect(tree.find(23)).toBe(23);
            tree.delete(23);
            expect(tree.find(23)).toBe(23);
            tree.delete(23);
            expect(tree.find(23)).toBe(undefined);
        });
    });
    describe("FindNext", () => {
        it("Should correctly obtain the next item if available", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            const vals = shuffle([1, 2, 3, 4, 8, 10, 14, 20, 25, 39]);
            vals.forEach(val => tree.insert(val));

            expect(tree.findNext(4)).toBe(8);
            expect(tree.findNext(12)).toBe(14);
            expect(tree.findNext(-20)).toBe(1);
            expect(tree.findNext(a => -1)).toBe(1);
        });
        it("Should not return anything if there is no next item", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            expect(tree.findNext(24)).toBe(undefined);

            const vals = shuffle([1, 2, 3, 4, 8, 10, 14, 20, 25, 39]);
            vals.forEach(val => tree.insert(val));

            expect(tree.findNext(50)).toBe(undefined);
            expect(tree.findNext(a => 1)).toBe(undefined);
        });
    });
    describe("FindPrevious", () => {
        it("Should correctly obtain the previous item if available", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            const vals = shuffle([1, 2, 3, 4, 8, 10, 14, 20, 25, 39]);
            vals.forEach(val => tree.insert(val));

            expect(tree.findPrevious(4)).toBe(3);
            expect(tree.findPrevious(12)).toBe(10);
            expect(tree.findPrevious(100)).toBe(39);
            expect(tree.findPrevious(a => 1)).toBe(39);
        });
        it("Should not return anything if there is no previous item", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            expect(tree.findPrevious(24)).toBe(undefined);

            const vals = shuffle([1, 2, 3, 4, 8, 10, 14, 20, 25, 39]);
            vals.forEach(val => tree.insert(val));

            expect(tree.findPrevious(0)).toBe(undefined);
            expect(tree.findPrevious(a => -1)).toBe(undefined);
        });
    });
    describe("FindRange", () => {
        it("Should correctly find any items within a specified range", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            const vals = shuffle([1, 2, 3, 4, 8, 10, 14, 20, 25, 39]);
            vals.forEach(val => tree.insert(val));

            expect(tree.findRange(4, 14)).toEqual([4, 8, 10, 14]);
            expect(tree.findRange(9, 26)).toEqual([10, 14, 20, 25]);
            expect(
                tree.findRange(
                    a => 15 - a,
                    a => 22 - a
                )
            ).toEqual([20]);
            expect(tree.findRange(-1, 90)).toEqual([1, 2, 3, 4, 8, 10, 14, 20, 25, 39]);
        });
        it("Should report all duplicates in a range", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            const vals = shuffle([1, 2, 3, 4, 4, 8, 10, 10, 10, 14, 14, 20, 25, 39]);
            vals.forEach(val => tree.insert(val));

            expect(tree.findRange(4, 4)).toEqual([4, 4]);
            expect(tree.findRange(7, 15)).toEqual([8, 10, 10, 10, 14, 14]);
        });
        it("Should report an empty list if no items are in the range", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            expect(tree.findRange(21, 24)).toEqual([]);

            const vals = shuffle([1, 2, 3, 4, 8, 10, 14, 20, 25, 39]);
            vals.forEach(val => tree.insert(val));

            expect(tree.findRange(21, 24)).toEqual([]);
            expect(tree.findRange(40, 90)).toEqual([]);
            expect(tree.findRange(-20, 0)).toEqual([]);
        });
    });
    describe("GetMin", () => {
        it("Should correctly retrieve the minimal element", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            const vals = shuffle([1, 2, 3, 4, 8, 10, 14, 20, 25, 39]);
            vals.forEach(val => tree.insert(val));

            expect(tree.getMin()).toBe(1);
            tree.insert(11);
            expect(tree.getMin()).toBe(1);
            tree.insert(-1);
            expect(tree.getMin()).toBe(-1);
        });
        it("Should return undefined if the tree is empty", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);

            expect(tree.getMin()).toBe(undefined);
        });
    });
    describe("GetMax", () => {
        it("Should correctly retrieve the maximal element", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);
            const vals = shuffle([1, 2, 3, 4, 8, 10, 14, 20, 25, 39]);
            vals.forEach(val => tree.insert(val));

            expect(tree.getMax()).toBe(39);
            tree.insert(11);
            expect(tree.getMax()).toBe(39);
            tree.insert(41);
            expect(tree.getMax()).toBe(41);
        });
        it("Should return undefined if the tree is empty", () => {
            const tree = new BalancedSearchTree<number>((a, b) => a - b);

            expect(tree.getMax()).toBe(undefined);
        });
    });
});
