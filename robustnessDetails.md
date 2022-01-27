-   BST should determine left and right most nodes, then return everything between. Recursive implementation that works on paper but does interval check per node could mess up because of rounding errors, E.g. old implementation had robustness issues (see current code for fix):

    ```ts
    class BSTNode {
        ...
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
        ...
    }
    ```

-   In intersection test, queries should happen before the boundaries are updated
-   When calculating the intersection, make sure the intersection doesn't occur after any of the segment's endpoints (simply replace the intersection by the segment endpoint if would occur earlier in the event ordering, see `checkIntersections`, `firstPoint`))
-   Don't add line continue events for empty line segments (segments with the same first and last endpoint)
-   Consider empty interval boundaries as vertical lines when it comes to sorting (see `getSideOfLineOrPoint`)

Still has some remaining issues. Cases that cause problems:

```json
[
    {
        "data": 1,
        "polygon": [
            {"x": 100, "y": 300},
            {"x": 400, "y": 300},
            {"x": 200, "y": 500},
            {
                "x": 287.83241577148436,
                "y": 334.74287719726567
            }
        ]
    },
    {
        "data": 3,
        "polygon": [
            {
                "x": 153.61181804124593,
                "y": 309.9164396245386
            },
            {
                "x": 230.26507669025517,
                "y": 324.0947950541613
            },
            {
                "x": 251.82219024694191,
                "y": 402.49629385320947
            },
            {
                "x": 307.67484687535966,
                "y": 300
            },
            {
                "x": 145.29009687535975,
                "y": 300
            }
        ]
    },
    {
        "data": 4,
        "polygon": [
            {"x": 284.4, "y": 415.6},
            {
                "x": 130.05215457482691,
                "y": 305.5586694746912
            },
            {
                "x": 206.10000000000005,
                "y": 300
            },
            {
                "x": 296.26651060432545,
                "y": 320.9356592398366
            },
            {"x": 310.9, "y": 389.1}
        ]
    },
    {
        "data": 5,
        "polygon": [
            {
                "x": 118.03841899999998,
                "y": 300
            },
            {
                "x": 258.4643325699035,
                "y": 312.1584146448314
            },
            {
                "x": 276.5859288936298,
                "y": 357.0518765872352
            },
            {
                "x": 231.61230688558516,
                "y": 377.96534452638036
            }
        ]
    },
    {
        "data": 6,
        "polygon": [
            {
                "x": 190.6356242736228,
                "y": 306.2856413131559
            },
            {
                "x": 255.18378534462406,
                "y": 328.7039442850717
            },
            {
                "x": 241.73118695130555,
                "y": 365.79612150946724
            },
            {
                "x": 185.0331625188909,
                "y": 345.9900453981884
            }
        ]
    },
    {
        "data": 7,
        "polygon": [
            {
                "x": 160.57225245824662,
                "y": 329.1983046573223
            },
            {
                "x": 173.84913809976695,
                "y": 304.8322268104981
            },
            {
                "x": 239.62009392259236,
                "y": 310.52683496473117
            },
            {
                "x": 248.81482120067398,
                "y": 346.264770815101
            },
            {
                "x": 234.7696828193839,
                "y": 363.36428932367073
            },
            {
                "x": 196.5019692935721,
                "y": 349.9963941582877
            }
        ]
    }
]
```

or

```json
[
    {
        "data": 4,
        "polygon": [
            {
                "x": 193.10000000000002,
                "y": 276.3
            },
            {"x": 382.1, "y": 509.3},
            {"x": 452.1, "y": 321.3}
        ]
    },
    {
        "data": 6,
        "polygon": [
            {
                "x": 175.36636171875003,
                "y": 333.02909999999997
            },
            {
                "x": 230.67377589218387,
                "y": 322.6211099623219
            },
            {
                "x": 233.10316171875004,
                "y": 295.6314
            }
        ]
    },
    {
        "data": 7,
        "polygon": [
            {"x": 190, "y": 300},
            {
                "x": 230.67377589218387,
                "y": 322.6211099623219
            },
            {
                "x": 363.66706171875006,
                "y": 333.68519999999995
            }
        ]
    }
]
```
