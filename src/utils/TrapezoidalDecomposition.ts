import {IPoint} from "../data/_types/IPoint";
import {ISegment} from "../data/_types/ISegment";
import {getSideOfLine} from "./getSideOfLine";
import {getSideOfPoint} from "./getSideOfPoint";
import {orientSegment} from "./orientSegment";
import {pointEquals} from "./pointEquals";
import {Side} from "./Side";
import {shuffle} from "./_tests/shuffle.helper";
import {
    IPointNode,
    ISegmentNode,
    ITrapezoid,
    ITrapezoidalDecompositionNode,
} from "./_types/ITrapezoidalNodes";

/**
 * Creates a vertical decomposition that can be used to efficiently query what line is directly below a given point
 */
export class TrapezoidalDecomposition<T> {
    public root: ITrapezoidalDecompositionNode<T>;

    /**
     * Creates a new vertical decomposition
     * @param segments The segments to add to the decomposition
     * @param outer The data for the outerface
     */
    public constructor(segments: (T & ISegment)[], outer?: T) {
        shuffle(segments);
        this.root = {
            left: {x: -Infinity, y: -Infinity},
            right: {x: Infinity, y: -Infinity},
            bottom: {
                start: {x: -Infinity, y: -Infinity},
                end: {x: Infinity, y: -Infinity},
                ...outer,
            } as ISegment & T,
            top: {
                start: {x: -Infinity, y: Infinity},
                end: {x: Infinity, y: Infinity},
                ...outer,
            } as ISegment & T,
            parents: [],
        };
        segments.forEach(segment => this.addSegment(segment));
    }

    /**
     * Finds the data associated to the segment that's directly below the given point
     * @param point The point to be queried
     * @returns The segment and it's metadata
     */
    public find(point: IPoint): T & ISegment {
        return this.findTrapezoid(point).bottom;
    }

    /**
     * Finds the trapezoid that the given segment starts in
     * @param segment The segment to be found
     * @returns The trapezoid that the segment's start point lies in
     */
    public findTrapezoid(segment: ISegment): ITrapezoid<T>;
    /**
     * Finds the trapezoid that the given point lies in
     * @param point The point to be found
     * @returns The trapezoid that the point lies in
     */
    public findTrapezoid(point: IPoint): ITrapezoid<T>;
    public findTrapezoid(segment: ISegment | IPoint): ITrapezoid<T> {
        let node: ITrapezoidalDecompositionNode<T> = this.root;

        if ("x" in segment) {
            const point = segment;
            while (!isTrapezoid(node)) {
                if (isSegmentNode(node)) {
                    if (this.isPointBelow(point, node.segment)) node = node.below;
                    else node = node.above;
                } else if (isPointNode(node)) {
                    if (
                        point.x >= node.point.x ||
                        //Apply symbolic shear transformation:
                        (point.x == node.point.x && point.y > node.point.y)
                    )
                        node = node.right;
                    else node = node.left;
                }
            }
        } else {
            const os = orientSegment(segment);
            while (!isTrapezoid(node)) {
                if (isSegmentNode(node)) {
                    if (this.isLineBelow(os, node.segment)) node = node.below;
                    else node = node.above;
                } else if (isPointNode(node)) {
                    if (
                        os.start.x >= node.point.x ||
                        (os.start.x == node.point.x && os.start.y > node.point.y)
                    )
                        node = node.right;
                    else node = node.left;
                }
            }
        }
        return node;
    }

    /**
     * Adds a new segment to this decomposition
     * @param segment The segment to be added
     */
    protected addSegment(segment: T & ISegment): void {
        const {start: edgeLeft, end: edgeRight} = orientSegment(segment);
        const trapezoids = this.findIntersectingTrapezoids(segment);
        let prev: ITrapezoid<T> | undefined,
            prevAbove: ITrapezoid<T> | undefined,
            prevBelow: ITrapezoid<T> | undefined;

        for (let i = 0; i < trapezoids.length; i++) {
            const trapezoid = trapezoids[i];
            const isFirst = i == 0;
            const isLast = i == trapezoids.length - 1;

            let below: ITrapezoid<T>,
                above: ITrapezoid<T>,
                startTrapezoid: ITrapezoid<T> | undefined,
                endTrapezoid: ITrapezoid<T> | undefined;

            const containsLeft = isFirst && !pointEquals(edgeLeft, trapezoid.left);
            const containsRight = isLast && !pointEquals(edgeRight, trapezoid.right);

            // Based on the position of the trapezoid, create the appropriate replacement trapezoids and link them
            if (isFirst && isLast) {
                below = {
                    left: edgeLeft,
                    right: edgeRight,
                    bottom: trapezoid.bottom,
                    top: segment,
                    parents: [],
                };
                above = {
                    left: edgeLeft,
                    right: edgeRight,
                    bottom: segment,
                    top: trapezoid.top,
                    parents: [],
                };
                startTrapezoid = this.createStart({
                    trapezoid,
                    edgeLeft,
                    containsLeft,
                    above,
                    below,
                });
                endTrapezoid = this.createEnd({
                    trapezoid,
                    edgeRight,
                    containsRight,
                    above,
                    below,
                });
            } else if (isFirst) {
                below = {
                    left: edgeLeft,
                    right: trapezoid.right,
                    bottom: trapezoid.bottom,
                    top: segment,
                    parents: [],
                };
                above = {
                    left: edgeLeft,
                    right: trapezoid.right,
                    bottom: segment,
                    top: trapezoid.top,
                    parents: [],
                };
                startTrapezoid = this.createStart({
                    trapezoid,
                    edgeLeft,
                    containsLeft,
                    above,
                    below,
                });
            } else if (isLast) {
                below = this.updateBelow({
                    prev: prev!,
                    prevBelow: prevBelow!,
                    trapezoid,
                    segment,
                    end: edgeRight,
                });
                above = this.updateAbove({
                    prev: prev!,
                    prevAbove: prevAbove!,
                    trapezoid,
                    segment,
                    end: edgeRight,
                });
                endTrapezoid = this.createEnd({
                    trapezoid,
                    edgeRight,
                    containsRight,
                    above,
                    below,
                });
            } else {
                below = this.updateBelow({
                    prev: prev!,
                    prevBelow: prevBelow!,
                    trapezoid,
                    segment,
                    end: trapezoid.right,
                });
                above = this.updateAbove({
                    prev: prev!,
                    prevAbove: prevAbove!,
                    trapezoid,
                    segment,
                    end: trapezoid.right,
                });
            }

            // Create the search tree node corresponding with the created trapezoids and add to the search tree
            let candidate: ITrapezoidalDecompositionNode<T> = {
                segment: segment,
                below,
                above,
            };
            if (endTrapezoid)
                candidate = {
                    point: edgeRight,
                    left: candidate,
                    right: endTrapezoid,
                };
            if (startTrapezoid)
                candidate = {
                    point: edgeLeft,
                    left: startTrapezoid,
                    right: candidate,
                };
            this.replaceTrapezoidInTree(trapezoid, candidate);

            // Update the 'previous' pointers
            prev = trapezoid;
            prevAbove = above;
            prevBelow = below;
        }
    }

    /**
     * Creates the start trapezoid of the segment, and properly updates neighbor references
     * @param data THe data to use to create the start trapezoid
     * @returns Either the created start trapezoid, or nothing if the edge start in an existing point
     */
    protected createStart({
        containsLeft,
        trapezoid,
        above,
        below,
        edgeLeft,
    }: {
        /** Whether the given trapezoid contains the left point (or whether it's an existing point ont be boundary) */
        containsLeft: boolean;
        /** The trapezoid that's being split */
        trapezoid: ITrapezoid<T>;
        /** The left start point of the edge */
        edgeLeft: IPoint;
        /** The created trapezoid that's above the inserted edge */
        above: ITrapezoid<T>;
        /** The created trapezoid that's below the inserted edge */
        below: ITrapezoid<T>;
    }): ITrapezoid<T> | undefined {
        let startTrapezoid: ITrapezoid<T> | undefined;
        if (containsLeft) {
            startTrapezoid = {
                ...trapezoid,
                parents: [],
                right: edgeLeft,
                RTN: above,
                RBN: below,
            };
            below.LBN = startTrapezoid;
            above.LTN = startTrapezoid;

            if (trapezoid.LTN?.RBN == trapezoid) trapezoid.LTN.RBN = startTrapezoid;
            if (trapezoid.LTN?.RTN == trapezoid) trapezoid.LTN.RTN = startTrapezoid;
            if (trapezoid.LBN?.RBN == trapezoid) trapezoid.LBN.RBN = startTrapezoid;
            if (trapezoid.LBN?.RTN == trapezoid) trapezoid.LBN.RTN = startTrapezoid;
        } else {
            below.LBN = trapezoid.LBN;
            above.LTN = trapezoid.LTN;

            if (trapezoid.LTN?.RBN == trapezoid) trapezoid.LTN.RBN = above;
            if (trapezoid.LTN?.RTN == trapezoid) trapezoid.LTN.RTN = above;
            if (trapezoid.LBN?.RBN == trapezoid) trapezoid.LBN.RBN = below;
            if (trapezoid.LBN?.RTN == trapezoid) trapezoid.LBN.RTN = below;
        }
        return startTrapezoid;
    }

    /**
     * Creates the end trapezoid of the segment, and properly updates neighbor references
     * @param data The data to use to create the end trapezoid
     * @returns Either the created end trapezoid, or nothing if the edge ended in an existing point
     */
    protected createEnd({
        containsRight,
        trapezoid,
        edgeRight,
        above,
        below,
    }: {
        /** Whether the given trapezoid contains the right point (or whether it's an existing point ont be boundary) */
        containsRight: boolean;
        /** The trapezoid that's being split */
        trapezoid: ITrapezoid<T>;
        /** The right end point of the edge */
        edgeRight: IPoint;
        /** The created trapezoid that's above the inserted edge */
        above: ITrapezoid<T>;
        /** The created trapezoid that's below the inserted edge */
        below: ITrapezoid<T>;
    }): ITrapezoid<T> | undefined {
        let endTrapezoid: ITrapezoid<T> | undefined;
        if (containsRight) {
            endTrapezoid = {
                ...trapezoid,
                parents: [],
                left: edgeRight,
                LTN: above,
                LBN: below,
            };
            below.RBN = endTrapezoid;
            above.RTN = endTrapezoid;

            if (trapezoid.RTN?.LBN == trapezoid) trapezoid.RTN.LBN = endTrapezoid;
            if (trapezoid.RTN?.LTN == trapezoid) trapezoid.RTN.LTN = endTrapezoid;
            if (trapezoid.RBN?.LBN == trapezoid) trapezoid.RBN.LBN = endTrapezoid;
            if (trapezoid.RBN?.LTN == trapezoid) trapezoid.RBN.LTN = endTrapezoid;
        } else {
            below.RBN = trapezoid.RBN;
            above.RTN = trapezoid.RTN;

            if (trapezoid.RTN?.LBN == trapezoid) trapezoid.RTN.LBN = above;
            if (trapezoid.RTN?.LTN == trapezoid) trapezoid.RTN.LTN = above;
            if (trapezoid.RBN?.LBN == trapezoid) trapezoid.RBN.LBN = below;
            if (trapezoid.RBN?.LTN == trapezoid) trapezoid.RBN.LTN = below;
        }
        return endTrapezoid;
    }

    /**
     * Updates the trapezoid above the segment, based on the new trapezoid it crosses, and properly updates neighbor references
     * @param data The data to use for the update
     * @returns The updated above segment trapezoid
     */
    protected updateAbove({
        prevAbove,
        trapezoid,
        segment,
        prev,
        end,
    }: {
        /** The trapezoid above the segment to the left */
        prevAbove: ITrapezoid<T>;
        /** The trapezoid to the left that was replaced by prevAbove */
        prev: ITrapezoid<T>;
        /** The trapezoid that's split into above and below */
        trapezoid: ITrapezoid<T>;
        /** The point that the above trapezoid should stop at */
        end: IPoint;
        /** The segment that splits the trapezoid */
        segment: ISegment & T;
    }): ITrapezoid<T> {
        let above: ITrapezoid<T>;
        if (prevAbove?.top == trapezoid.top) {
            above = prevAbove;
            above.right = end;
        } else {
            above = {
                left: trapezoid.left,
                right: end,
                bottom: segment,
                top: trapezoid.top,
                parents: [],
                LBN: prevAbove,
                LTN: trapezoid.LTN != prev ? trapezoid.LTN : undefined,
            };

            if (prev?.RTN) {
                prevAbove!.RTN = prev.RTN;
                prev.RTN.LTN = prevAbove;
            }
            prevAbove!.RBN = above;

            if (trapezoid.LTN != prev && trapezoid.LTN?.RTN == trapezoid)
                trapezoid.LTN.RTN = above;
        }
        return above;
    }

    /**
     * Updates the trapezoid below the segment, based on the new trapezoid it crosses, and properly updates neighbor references
     * @param data The data to use for the update
     * @returns The updated below segment trapezoid
     */
    protected updateBelow({
        prevBelow,
        trapezoid,
        segment,
        prev,
        end,
    }: {
        /** The trapezoid below the segment to the left */
        prevBelow: ITrapezoid<T>;
        /** The trapezoid to the left that was replaced by prevBelow */
        prev: ITrapezoid<T>;
        /** The trapezoid that's split into above and below */
        trapezoid: ITrapezoid<T>;
        /** The point that the above trapezoid should stop at */
        end: IPoint;
        /** The segment that splits the trapezoid */
        segment: ISegment & T;
    }): ITrapezoid<T> {
        let below: ITrapezoid<T>;
        if (prevBelow?.bottom == trapezoid.bottom) {
            below = prevBelow;
            below.right = end;
        } else {
            below = {
                left: trapezoid.left,
                right: end,
                bottom: trapezoid.bottom,
                top: segment,
                parents: [],
                LTN: prevBelow,
                LBN: trapezoid.LBN != prev ? trapezoid.LBN : undefined,
            };

            if (prev?.RBN) {
                prevBelow!.RBN = prev.RBN;
                prev.RBN.LBN = prevBelow;
            }
            prevBelow!.RTN = below;

            if (trapezoid.LBN != prev && trapezoid.LBN?.RBN == trapezoid)
                trapezoid.LBN.RBN = below;
        }
        return below;
    }

    /**
     * Retrieves all trapezoids that the given segment intersects
     * @param segment The segment to be checked
     * @returns The intersected trapezoids
     */
    protected findIntersectingTrapezoids(segment: ISegment): ITrapezoid<T>[] {
        const os = orientSegment(segment);
        const start = this.findTrapezoid(segment);
        const out = [start];

        let last: ITrapezoid<T> | undefined = start;
        while (last && last.right.x < os.end.x) {
            if (getSideOfLine(os, last.right) == Side.right) last = last.RTN ?? last.RBN;
            else last = last.RBN ?? last.RTN;

            if (last) out.push(last);
        }

        return out;
    }

    /**
     * Determines whether segment a is below segment b
     * @param a Segment a
     * @param b Segment b
     * Whether a is below b
     */
    protected isLineBelow(a: ISegment, b: ISegment): boolean {
        const oa = orientSegment(a);
        const {start: aLeft, end: aRight} = oa;
        const ob = orientSegment(b);
        const {start: bLeft, end: bRight} = ob;

        const bLeftSide = getSideOfLine(oa, bLeft);
        const bRightSide = getSideOfLine(oa, bRight);

        if (bLeftSide == bRightSide) return bLeftSide == Side.left;
        else if (bLeftSide == Side.on) return bRightSide == Side.left;

        const aLeftSide = getSideOfLine(ob, aLeft);
        const aRightSide = getSideOfLine(ob, aRight);
        if (aLeftSide == aRightSide) return aLeftSide == Side.right;
        else if (aLeftSide == Side.on) return aRightSide == Side.right;
        else if (bRightSide == Side.on) return bLeftSide == Side.left;
        else if (aRightSide == Side.on) return aLeftSide == Side.right;
        else {
            console.error(a, b);
            throw Error("Edges may not cross");
        }
    }

    /**
     * Determines whether line a is below segment b
     * @param a Line a
     * @param b Segment b
     * Whether a is below b
     */
    protected isPointBelow(a: IPoint, b: ISegment) {
        return getSideOfLine(orientSegment(b), a) == Side.right;
    }

    /**
     * Replaces the given trapezoid node with a new node within all its parents
     * @param trapezoid The trapezoidal node in the tree
     * @param newNode The node to replace the trapezoid by
     */
    protected replaceTrapezoidInTree(
        trapezoid: ITrapezoid,
        newNode: ITrapezoidalDecompositionNode<T>
    ): void {
        const isRoot = !trapezoid.parents.length;
        this.linkNodes(newNode);
        trapezoid.parents.forEach(parent => {
            if (isPointNode(parent)) {
                if (parent.left == trapezoid) parent.left = newNode;
                if (parent.right == trapezoid) parent.right = newNode;
            } else if (isSegmentNode(parent)) {
                if (parent.above == trapezoid) parent.above = newNode;
                if (parent.below == trapezoid) parent.below = newNode;
            }
        });
        if (isRoot) this.root = newNode;
    }

    /**
     * Links the parents in the leafs
     * @param node The node to link the parent in
     * @param parent The parent of the given node
     */
    protected linkNodes(
        node: ITrapezoidalDecompositionNode<T>,
        parent?: ITrapezoidalDecompositionNode<T>
    ): void {
        if (isPointNode(node)) {
            this.linkNodes(node.left, node);
            this.linkNodes(node.right, node);
        } else if (isSegmentNode(node)) {
            this.linkNodes(node.above, node);
            this.linkNodes(node.below, node);
        } else if (parent && !node.parents.includes(parent)) {
            node.parents.push(parent);
        }
    }
}

/**
 * Checks whether a given node is a trapezoid
 * @param node The node to be checked
 * @returns Whether the node is a trapezoid
 */
export function isTrapezoid<T>(
    node: ITrapezoidalDecompositionNode<T>
): node is ITrapezoid<T> {
    return "top" in node;
}

/**
 * Checks whether the given node is a point node
 * @param node The node to be checked
 * @returns Whether the node is a point node
 */
export function isPointNode<T>(
    node: ITrapezoidalDecompositionNode<T>
): node is IPointNode<T> {
    return "point" in node;
}

/**
 * Checks whether the given node is a segment node
 * @param node The node to be checked
 * @returns Whether the node is a segment node
 */
export function isSegmentNode<T>(
    node: ITrapezoidalDecompositionNode<T>
): node is ISegmentNode<T> {
    return "segment" in node;
}
