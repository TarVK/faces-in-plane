/**
 * A generalized AVL self balancing search tree,
 * allows duplicates/incomparable items
 */
export class BalancedSearchTree<D> {
    protected root: BSTNode<D> | undefined;
    protected compare: (a: D | Comp<D>, b: D) => number;

    /**
     * Creates a new balanced search tree
     * @param compare The data comparison function, result < 0 iff a < b, result > 0 iff a > b, result = 0 otherwise
     */
    public constructor(compare: (a: D, b: D) => number) {
        this.compare = (a, b) => (a instanceof Function ? a(b) : compare(a, b));
    }

    /**
     * Inserts the given data element
     * @param data The data element to be inserted
     */
    public insert(data: D): void {
        if (!this.root) this.root = new BSTNode(data, this.compare);
        else this.root = this.root.insert(data);
    }

    /**
     * Deletes the given data element
     * @param data The data element to be deleted
     */
    public delete(data: D): void;

    /**
     * Deletes the given data element
     * @param compare The data comparison function, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     */
    public delete(compare: (item: D) => number): void;
    public delete(data: D | ((item: D) => number)): void {
        if (!this.root) return;
        this.root = this.root.delete(data);
    }

    /**
     * Checks whether the given data element is in the tree
     * @param data The data element to find
     * @returns The data element that was found, if any
     */
    public find(data: D): D | undefined;
    /**
     * Tries to find a data element according to the given comparison function
     * @param compare The data comparison function, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @returns The data element that was found, if any
     */
    public find(compare: (item: D) => number): D | undefined;
    public find(data: D | ((item: D) => number)): D | undefined {
        return this.root?.find(data);
    }

    /**
     * Finds the smallest element that's larger than the given element
     * @param data The data element to find
     * @returns The data element that was found, if any
     */
    public findNext(data: D): D | undefined;
    /**
     * Finds the smallest element that's bigger than the one specified by the given comparison function
     * @param compare The data comparison function, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @returns The data element that was found, if any
     */
    public findNext(compare: (item: D) => number): D | undefined;
    public findNext(data: D | ((item: D) => number)): D | undefined {
        return this.root?.findNext(data)?.result;
    }

    /**
     * Finds the largest element that's smaller than the given element
     * @param data The data element to find
     * @returns The data element that was found, if any
     */
    public findPrevious(data: D): D | undefined;
    /**
     * Finds the largest element that's smaller than the one specified by the given comparison function
     * @param compare The data comparison function, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @returns The data element that was found, if any
     */
    public findPrevious(compare: (item: D) => number): D | undefined;
    public findPrevious(data: D | ((item: D) => number)): D | undefined {
        return this.root?.findPrevious(data)?.result;
    }

    /**
     * Finds a range of data elements that's between the start and end
     * @param start The element marking the start of the range
     * @param end The element marking the end of the range
     * @returns The data elements that were found
     */
    public findRange(start: D, end: D): D[] | undefined;
    /**
     * Finds a range of element that's between the start and end comparison functions
     * @param start The data comparison function for the start of the range, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @param end The data comparison function for the end of the range, result < 0 iff query < item, result > 0 iff query > item, result = 0 otherwise
     * @returns The data elements that were found
     */
    public findRange(start: (item: D) => number, end: (item: D) => number): D[];
    public findRange(
        start: D | ((item: D) => number),
        end: D | ((item: D) => number)
    ): D[] {
        const output: D[] = [];
        this.root?.findRange(start, end, output);
        return output;
    }

    /**
     * Retrieves the smallest item in the tree
     * @returns The minimal element, if the tree isn't empty
     */
    public getMin(): D | undefined {
        return this.root?.getMin();
    }

    /**
     * Retrieves the largest item in the tree
     * @returns The maximal element, if the tree isn't empty
     */
    public getMax(): D | undefined {
        return this.root?.getMax();
    }

    /**
     * Retrieves all the items in the tree
     * @returns All the stored items
     */
    public getAll(): D[] {
        const output: D[] = [];
        this.root?.getAll(output);
        return output;
    }
}

export class BSTNode<D> {
    protected compare: (a: D | Comp<D>, b: D) => number;
    public item: D;
    public height: number;
    public left?: BSTNode<D>;
    public right?: BSTNode<D>;

    /**
     * Creates a new BSTNode
     * @param item The item to be added
     * @param compare The comparison function
     * @param left The left subtree
     * @param right The right subtree
     */
    public constructor(
        item: D,
        compare: (a: D | Comp<D>, b: D) => number,
        left?: BSTNode<D>,
        right?: BSTNode<D>
    ) {
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
    public insert(data: D): BSTNode<D> {
        const side = this.compare(data, this.item);
        if (side < 0) {
            if (this.left) this.left = this.left.insert(data);
            else this.left = new BSTNode(data, this.compare);
        } else {
            if (this.right) this.right = this.right.insert(data);
            else this.right = new BSTNode(data, this.compare);
        }

        return this.rebalance();
    }

    /**
     * Deletes the given data element
     * @param data The data element to be deleted
     * @returns The new node representing this subtree after deletion
     */
    public delete(data: D | Comp<D>): BSTNode<D> | undefined {
        const side = this.compare(data, this.item);

        let newNode: BSTNode<D> | undefined;
        if (side < 0) {
            if (!this.left) return this;
            this.left = this.left.delete(data);
            newNode = this;
        } else if (side > 0) {
            if (!this.right) return this;
            this.right = this.right.delete(data);
            newNode = this;
        } else {
            // This node itself should be deleted
            if (!this.left) newNode = this.right;
            else if (!this.right) newNode = this.left;
            else {
                const next = this.right.getMin();
                const newRight = this.right.delete(next);
                newNode = new BSTNode(next, this.compare, this.left, newRight);
            }
        }

        return newNode?.rebalance();
    }

    /**
     * Tries to find the specified data
     * @param data The data to be found
     * @returns The data if it could be found
     */
    public find(data: D | Comp<D>): D | undefined {
        const side = this.compare(data, this.item);
        if (side < 0) return this.left?.find(data);
        else if (side > 0) return this.right?.find(data);
        return this.item;
    }

    /**
     * Tries to find the smallest element that's larger than the specified element
     * @param data The data to be retrieved
     * @returns The next element
     */
    public findNext(data: D | Comp<D>): {result: D} | undefined {
        const side = this.compare(data, this.item);
        if (side < 0) {
            const nextItem = this.left?.findNext(data);
            if (nextItem) return nextItem;
            return {result: this.item};
        } else {
            return this.right?.findNext(data);
        }
    }

    /**
     * Tries to find the largest element that's smaller than the specified element
     * @param data The data to be retrieved
     * @returns The next element
     */
    public findPrevious(data: D | Comp<D>): {result: D} | undefined {
        const side = this.compare(data, this.item);
        if (side > 0) {
            const previousItem = this.right?.findPrevious(data);
            if (previousItem) return previousItem;
            return {result: this.item};
        } else {
            return this.left?.findPrevious(data);
        }
    }

    /**
     * Finds a range of element that's between the start and end comparison functions
     * @param start The element marking the start of the range
     * @param end The element marking the end of the range
     * @param output The output to accumulate the results in
     */
    public findRange(
        start: D | ((item: D) => number),
        end: D | ((item: D) => number),
        output: D[]
    ): void {
        const startSide = this.compare(start, this.item);
        const endSide = this.compare(end, this.item);

        if (startSide < 0) this.left?.findRange(start, end, output);
        if (startSide <= 0 && endSide >= 0) output.push(this.item);
        if (endSide >= 0) this.right?.findRange(start, end, output);
    }

    /**
     * Retrieves all the items in this subtree
     * @param output The output list to accumulate the results in
     */
    public getAll(output: D[]): void {
        this.left?.getAll(output);
        output.push(this.item);
        this.right?.getAll(output);
    }

    /**
     * Retrieves the minimal element of this subtree
     * @returns The minimal item
     */
    public getMin(): D {
        if (this.left) return this.left.getMin();
        return this.item;
    }

    /**
     * Retrieves the maximal element of this subtree
     * @returns The maximal item
     */
    public getMax(): D {
        if (this.right) return this.right.getMax();
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
    public getBalance(): number {
        return (this.right?.height ?? 0) - (this.left?.height ?? 0);
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
    public rotateLeft(): BSTNode<D> {
        const x = this.right!;
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
    public rotateRight(): BSTNode<D> {
        const x = this.left!;
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
    public rebalance(): BSTNode<D> {
        // For more info, see: https://www.geeksforgeeks.org/avl-tree-set-2-deletion/?ref=lbp
        const balance = this.getBalance();
        if (balance < -1) {
            const childBalance = this.left!.getBalance();
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
                this.left = this.left!.rotateLeft();
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
        } else if (balance > 1) {
            const childBalance = this.right!.getBalance();
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
                this.right = this.right!.rotateRight();
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

/**  An element comparison function*/
type Comp<D> = (item: D) => number;

/**
 * Retrieves the height of a node with the given left and right subtrees
 * @param left The left subtree
 * @param right The right subtree
 * @returns The height of this node
 */
function height(left: BSTNode<any> | undefined, right: BSTNode<any> | undefined): number {
    return Math.max(left?.height ?? 0, right?.height ?? 0) + 1;
}
