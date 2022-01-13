"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BSTNode = exports.BalancedSearchTree = void 0;
/**
 * A generalized AVL self balancing search tree,
 * allows duplicates/incomparable items
 */
class BalancedSearchTree {
    /**
     * Creates a new balanced search tree
     * @param compare The data comparison function, result < 0 iff a < b, result > 0 iff a > b, result = 0 otherwise
     */
    constructor(compare) {
        this.compare = (a, b) => (a instanceof Function ? a(b) : compare(a, b));
    }
    /**
     * Inserts the given data element
     * @param data The data element to be inserted
     */
    insert(data) {
        if (!this.root)
            this.root = new BSTNode(data, this.compare);
        else
            this.root = this.root.insert(data);
    }
    delete(data) {
        if (!this.root)
            return;
        this.root = this.root.delete(data);
    }
    find(data) {
        var _a;
        return (_a = this.root) === null || _a === void 0 ? void 0 : _a.find(data);
    }
    findNext(data) {
        var _a, _b;
        return (_b = (_a = this.root) === null || _a === void 0 ? void 0 : _a.findNext(data)) === null || _b === void 0 ? void 0 : _b.result;
    }
    findPrevious(data) {
        var _a, _b;
        return (_b = (_a = this.root) === null || _a === void 0 ? void 0 : _a.findPrevious(data)) === null || _b === void 0 ? void 0 : _b.result;
    }
    findRange(start, end) {
        var _a;
        const output = [];
        (_a = this.root) === null || _a === void 0 ? void 0 : _a.findRange(start, end, output);
        return output;
    }
    /**
     * Retrieves the smallest item in the tree
     * @returns The minimal element, if the tree isn't empty
     */
    getMin() {
        var _a;
        return (_a = this.root) === null || _a === void 0 ? void 0 : _a.getMin();
    }
    /**
     * Retrieves the largest item in the tree
     * @returns The maximal element, if the tree isn't empty
     */
    getMax() {
        var _a;
        return (_a = this.root) === null || _a === void 0 ? void 0 : _a.getMax();
    }
    /**
     * Retrieves all the items in the tree
     * @returns All the stored items
     */
    getAll() {
        var _a;
        const output = [];
        (_a = this.root) === null || _a === void 0 ? void 0 : _a.getAll(output);
        return output;
    }
    /**
     * A list getter for easier console debugging
     * @returns The BST's sorted contents
     */
    get list() {
        return this.getAll();
    }
}
exports.BalancedSearchTree = BalancedSearchTree;
class BSTNode {
    /**
     * Creates a new BSTNode
     * @param item The item to be added
     * @param compare The comparison function
     * @param left The left subtree
     * @param right The right subtree
     */
    constructor(item, compare, left, right) {
        this.item = item;
        this.compare = compare;
        this.height = 1;
        this.left = left;
        this.right = right;
    }
    /**
     * Inserts the given data element
     * @param data The data element to be inserted
     * @returns The new node that represents this subtree after insertion
     */
    insert(data) {
        const side = this.compare(data, this.item);
        if (side < 0) {
            if (this.left)
                this.left = this.left.insert(data);
            else
                this.left = new BSTNode(data, this.compare);
        }
        else {
            if (this.right)
                this.right = this.right.insert(data);
            else
                this.right = new BSTNode(data, this.compare);
        }
        return this.rebalance();
    }
    /**
     * Deletes the given data element
     * @param data The data element to be deleted
     * @returns The new node representing this subtree after deletion
     */
    delete(data) {
        const side = this.compare(data, this.item);
        let newNode;
        if (side < 0) {
            if (!this.left)
                return this;
            this.left = this.left.delete(data);
            newNode = this;
        }
        else if (side > 0) {
            if (!this.right)
                return this;
            this.right = this.right.delete(data);
            newNode = this;
        }
        else {
            // This node itself should be deleted
            if (!this.left)
                newNode = this.right;
            else if (!this.right)
                newNode = this.left;
            else {
                const next = this.right.getMin();
                const newRight = this.right.delete(next);
                newNode = new BSTNode(next, this.compare, this.left, newRight);
            }
        }
        return newNode === null || newNode === void 0 ? void 0 : newNode.rebalance();
    }
    /**
     * Tries to find the specified data
     * @param data The data to be found
     * @returns The data if it could be found
     */
    find(data) {
        var _a, _b;
        const side = this.compare(data, this.item);
        if (side < 0)
            return (_a = this.left) === null || _a === void 0 ? void 0 : _a.find(data);
        else if (side > 0)
            return (_b = this.right) === null || _b === void 0 ? void 0 : _b.find(data);
        return this.item;
    }
    /**
     * Tries to find the smallest element that's larger than the specified element
     * @param data The data to be retrieved
     * @returns The next element
     */
    findNext(data) {
        var _a, _b;
        const side = this.compare(data, this.item);
        if (side < 0) {
            const nextItem = (_a = this.left) === null || _a === void 0 ? void 0 : _a.findNext(data);
            if (nextItem)
                return nextItem;
            return { result: this.item };
        }
        else {
            return (_b = this.right) === null || _b === void 0 ? void 0 : _b.findNext(data);
        }
    }
    /**
     * Tries to find the largest element that's smaller than the specified element
     * @param data The data to be retrieved
     * @returns The next element
     */
    findPrevious(data) {
        var _a, _b;
        const side = this.compare(data, this.item);
        if (side > 0) {
            const previousItem = (_a = this.right) === null || _a === void 0 ? void 0 : _a.findPrevious(data);
            if (previousItem)
                return previousItem;
            return { result: this.item };
        }
        else {
            return (_b = this.left) === null || _b === void 0 ? void 0 : _b.findPrevious(data);
        }
    }
    /**
     * Finds a range of element that's between the start and end comparison functions
     * @param start The element marking the start of the range
     * @param end The element marking the end of the range
     * @param output The output to accumulate the results in
     */
    findRange(start, end, output) {
        var _a, _b;
        const startSide = this.compare(start, this.item);
        const endSide = this.compare(end, this.item);
        if (startSide < 0)
            (_a = this.left) === null || _a === void 0 ? void 0 : _a.findRange(start, end, output);
        if (startSide <= 0 && endSide >= 0)
            output.push(this.item);
        if (endSide >= 0)
            (_b = this.right) === null || _b === void 0 ? void 0 : _b.findRange(start, end, output);
    }
    /**
     * Retrieves all the items in this subtree
     * @param output The output list to accumulate the results in
     */
    getAll(output) {
        var _a, _b;
        (_a = this.left) === null || _a === void 0 ? void 0 : _a.getAll(output);
        output.push(this.item);
        (_b = this.right) === null || _b === void 0 ? void 0 : _b.getAll(output);
    }
    /**
     * Retrieves the minimal element of this subtree
     * @returns The minimal item
     */
    getMin() {
        if (this.left)
            return this.left.getMin();
        return this.item;
    }
    /**
     * Retrieves the maximal element of this subtree
     * @returns The maximal item
     */
    getMax() {
        if (this.right)
            return this.right.getMax();
        return this.item;
    }
    /********************
     * Internal utils   *
     ********************/
    /**
     * Retrieves the balance of the tree.
     * E.g: -1 means the left subtree has 1 more than the right, 2 means the right subtree has 2 more than the left
     * @returns The balance
     */
    getBalance() {
        var _a, _b, _c, _d;
        return ((_b = (_a = this.right) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = this.left) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    }
    /**
     * Rotates left
     * ```txt
     *
     *    this             x
     *   /    \          /   \
     *  T1     x   =>  this  T3
     *        / \      /  \
     *       T2 T3    T1  T2
     * ```
     * @returns The new root node of the tree represented by the subtree of this node, after a left rotation
     */
    rotateLeft() {
        const x = this.right;
        const T2 = x.left;
        this.right = T2;
        x.left = this;
        this.height = height(this.left, this.right);
        x.height = height(x.left, x.right);
        return x;
    }
    /**
     * Rotates right:
     * ```txt
     *
     *     this           x
     *    /    \        /   \
     *   x     T3  =>  T1  this
     *  / \                /  \
     * T1 T2              T2  T3
     * ```
     * @returns The new root node of the tree represented by the subtree of this node, after a left rotation
     */
    rotateRight() {
        const x = this.left;
        const T2 = x.right;
        this.left = T2;
        x.right = this;
        this.height = height(this.left, this.right);
        x.height = height(x.left, x.right);
        return x;
    }
    /**
     * Re-balances this subtree
     * @returns The node representing this subtree after rebalancing
     */
    rebalance() {
        // For more info, see: https://www.geeksforgeeks.org/avl-tree-set-2-deletion/?ref=lbp
        const balance = this.getBalance();
        if (balance < -1) {
            const childBalance = this.left.getBalance();
            if (childBalance > 0) {
                /**
                 *     this                            this
                 *      / \                            /   \
                 *     y   T4  Left Rotate (y)        x    T4
                 *    / \      - - - - - - - - ->    /  \
                 *  T1   x                          y    T3
                 *      / \                        / \
                 *    T2   T3                    T1   T2
                 */
                this.left = this.left.rotateLeft();
                // Note: height gets fixed automatically when performing the next rotation
            }
            /**
             *        this                                     y
             *         / \                                   /   \
             *        y   T4      Right Rotate (z)          x     this
             *       / \          - - - - - - - - ->      /  \    /  \
             *      x   T3                               T1  T2  T3  T4
             *     / \
             *   T1   T2
             */
            return this.rotateRight();
        }
        else if (balance > 1) {
            const childBalance = this.right.getBalance();
            if (childBalance < 0) {
                /**
                 *   this                         this
                 *    / \                          / \
                 *  T1   y   Right Rotate (y)    T1   x
                 *      / \  - - - - - - - - ->     /  \
                 *     x   T4                      T2   y
                 *    / \                              /  \
                 *  T2   T3                           T3   T4
                 */
                this.right = this.right.rotateRight();
                // Note: height gets fixed automatically when performing the next rotation
            }
            /**
             *   this                              y
             *   /  \                            /   \
             *  T1   y     Left Rotate(z)      this    x
             *      /  \   - - - - - - - ->    / \    / \
             *     T2   x                     T1  T2 T3  T4
             *         / \
             *       T3  T4
             */
            return this.rotateLeft();
        }
        // Update the height if no rebalance was necessary
        this.height = height(this.left, this.right);
        return this;
    }
}
exports.BSTNode = BSTNode;
/**
 * Retrieves the height of a node with the given left and right subtrees
 * @param left The left subtree
 * @param right The right subtree
 * @returns The height of this node
 */
function height(left, right) {
    var _a, _b;
    return Math.max((_a = left === null || left === void 0 ? void 0 : left.height) !== null && _a !== void 0 ? _a : 0, (_b = right === null || right === void 0 ? void 0 : right.height) !== null && _b !== void 0 ? _b : 0) + 1;
}
//# sourceMappingURL=BalancedSearchTree.js.map