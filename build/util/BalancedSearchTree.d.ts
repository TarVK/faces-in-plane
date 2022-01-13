/**
 * A generalized AVL self balancing search tree,
 * allows duplicates/incomparable items
 */
export declare class BalancedSearchTree<D> {
    protected root: BSTNode<D> | undefined;
    protected compare: (a: D | Comp<D>, b: D) => number;
    /**
     * Creates a new balanced search tree
     * @param compare The data comparison function, result < 0 iff a < b, result > 0 iff a > b, result = 0 otherwise
     */
    constructor(compare: (a: D, b: D) => number);
    /**
     * Inserts the given data element
     * @param data The data element to be inserted
     */
    insert(data: D): void;
    /**
     * Deletes the given data element
     * @param data The data element to be deleted
     */
    delete(data: D): void;
    /**
     * Deletes the given data element
     * @param compare The data comparison function, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     */
    delete(compare: (item: D) => number): void;
    /**
     * Checks whether the given data element is in the tree
     * @param data The data element to find
     * @returns The data element that was found, if any
     */
    find(data: D): D | undefined;
    /**
     * Tries to find a data element according to the given comparison function
     * @param compare The data comparison function, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @returns The data element that was found, if any
     */
    find(compare: (item: D) => number): D | undefined;
    /**
     * Finds the smallest element that's larger than the given element
     * @param data The data element to find
     * @returns The data element that was found, if any
     */
    findNext(data: D): D | undefined;
    /**
     * Finds the smallest element that's bigger than the one specified by the given comparison function
     * @param compare The data comparison function, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @returns The data element that was found, if any
     */
    findNext(compare: (item: D) => number): D | undefined;
    /**
     * Finds the largest element that's smaller than the given element
     * @param data The data element to find
     * @returns The data element that was found, if any
     */
    findPrevious(data: D): D | undefined;
    /**
     * Finds the largest element that's smaller than the one specified by the given comparison function
     * @param compare The data comparison function, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @returns The data element that was found, if any
     */
    findPrevious(compare: (item: D) => number): D | undefined;
    /**
     * Finds a range of data elements that's between the start and end
     * @param start The element marking the start of the range
     * @param end The element marking the end of the range
     * @returns The data elements that were found
     */
    findRange(start: D, end: D): D[] | undefined;
    /**
     * Finds a range of element that's between the start and end comparison functions
     * @param start The data comparison function for the start of the range, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @param end The data comparison function for the end of the range, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @returns The data elements that were found
     */
    findRange(start: (item: D) => number, end: (item: D) => number): D[];
    /**
     * Retrieves the smallest item in the tree
     * @returns The minimal element, if the tree isn't empty
     */
    getMin(): D | undefined;
    /**
     * Retrieves the largest item in the tree
     * @returns The maximal element, if the tree isn't empty
     */
    getMax(): D | undefined;
    /**
     * Retrieves all the items in the tree
     * @returns All the stored items
     */
    getAll(): D[];
    /**
     * A list getter for easier console debugging
     * @returns The BST's sorted contents
     */
    protected get list(): D[];
}
export declare class BSTNode<D> {
    protected compare: (a: D | Comp<D>, b: D) => number;
    item: D;
    height: number;
    left?: BSTNode<D>;
    right?: BSTNode<D>;
    /**
     * Creates a new BSTNode
     * @param item The item to be added
     * @param compare The comparison function
     * @param left The left subtree
     * @param right The right subtree
     */
    constructor(item: D, compare: (a: D | Comp<D>, b: D) => number, left?: BSTNode<D>, right?: BSTNode<D>);
    /**
     * Inserts the given data element
     * @param data The data element to be inserted
     * @returns The new node that represents this subtree after insertion
     */
    insert(data: D): BSTNode<D>;
    /**
     * Deletes the given data element
     * @param data The data element to be deleted
     * @returns The new node representing this subtree after deletion
     */
    delete(data: D | Comp<D>): BSTNode<D> | undefined;
    /**
     * Tries to find the specified data
     * @param data The data to be found
     * @returns The data if it could be found
     */
    find(data: D | Comp<D>): D | undefined;
    /**
     * Tries to find the smallest element that's larger than the specified element
     * @param data The data to be retrieved
     * @returns The next element
     */
    findNext(data: D | Comp<D>): {
        result: D;
    } | undefined;
    /**
     * Tries to find the largest element that's smaller than the specified element
     * @param data The data to be retrieved
     * @returns The next element
     */
    findPrevious(data: D | Comp<D>): {
        result: D;
    } | undefined;
    /**
     * Finds a range of element that's between the start and end comparison functions
     * @param start The element marking the start of the range
     * @param end The element marking the end of the range
     * @param output The output to accumulate the results in
     */
    findRange(start: D | ((item: D) => number), end: D | ((item: D) => number), output: D[]): void;
    /**
     * Retrieves all the items in this subtree
     * @param output The output list to accumulate the results in
     */
    getAll(output: D[]): void;
    /**
     * Retrieves the minimal element of this subtree
     * @returns The minimal item
     */
    getMin(): D;
    /**
     * Retrieves the maximal element of this subtree
     * @returns The maximal item
     */
    getMax(): D;
    /********************
     * Internal utils   *
     ********************/
    /**
     * Retrieves the balance of the tree.
     * E.g: -1 means the left subtree has 1 more than the right, 2 means the right subtree has 2 more than the left
     * @returns The balance
     */
    getBalance(): number;
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
    rotateLeft(): BSTNode<D>;
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
    rotateRight(): BSTNode<D>;
    /**
     * Re-balances this subtree
     * @returns The node representing this subtree after rebalancing
     */
    rebalance(): BSTNode<D>;
}
/**  An element comparison function*/
declare type Comp<D> = (item: D) => number;
export {};
//# sourceMappingURL=BalancedSearchTree.d.ts.map