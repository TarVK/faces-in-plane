import {combineFaces, IFace} from "..";

describe("combineFaces", () => {
    it("Should correctly output individual polygons", () => {
        const p1: IFace<number> = {
            data: 1,
            polygon: [
                {x: 250, y: 50},
                {x: 350, y: 150},
                {x: 300, y: 250},
                {x: 150, y: 150},
            ],
        };
        const polygons = [p1];

        const out = combineFaces(polygons);

        verifyShape(out, [[4, [p1]]]);
    });

    it("Should correctly deal with shared endpoints", () => {
        // https://puu.sh/ICmEi/35a9c5eaa9.png
        const p1: IFace<number> = {
            data: 1,
            polygon: [
                {x: 250, y: 50},
                {x: 350, y: 150},
                {x: 300, y: 250},
                {x: 150, y: 150},
            ],
        };
        const p2: IFace<number> = {
            data: 2,
            polygon: [
                {x: 300, y: 50},
                {x: 400, y: 150},
                {x: 300, y: 250},
                {x: 200, y: 150},
            ],
        };
        const polygons = [p1, p2];

        const out = combineFaces(polygons);

        verifyShape(out, [
            [5, [p1]],
            [4, [p1, p2]],
            [5, [p2]],
        ]);
    });

    it("Should properly handle arbitrary input", () => {
        // https://puu.sh/ICodJ/2dc0d346f4.png
        const p1: IFace<number> = {
            data: 1,
            polygon: [
                {x: 50, y: 50},
                {x: 200, y: 40},
                {x: 320, y: 200},
                {x: 250, y: 300},
                {x: 200, y: 250},
                {x: 100, y: 250},
                {x: 40, y: 350},
            ],
        };
        const p2: IFace<number> = {
            data: 2,
            polygon: [
                {x: 280, y: 70},
                {x: 400, y: 120},
                {x: 450, y: 200},
                {x: 400, y: 350},
                {x: 200, y: 450},
                {x: 230, y: 400},
                {x: 300, y: 350},
                {x: 260, y: 300},
                {x: 200, y: 270},
            ],
        };
        const polygons = [p1, p2];

        const out = combineFaces(polygons);

        verifyShape(out, [
            [7, [p1]],
            [11, [p2]],
            [5, [p1, p2]],
            [3, [p2]],
            [3, [p1]],
        ]);
    });

    it("Should handle holes", () => {
        // https://puu.sh/ICoqE/f528081514.png
        const p1: IFace<number> = {
            data: 1,
            polygon: [
                {x: 150, y: 50},
                {x: 250, y: 100},
                {x: 250, y: 200},
                {x: 150, y: 250},
                {x: 50, y: 200},
                {x: 50, y: 100},
            ],
        };
        const p2: IFace<number> = {
            data: 2,
            polygon: [
                {x: 150, y: 100},
                {x: 200, y: 150},
                {x: 150, y: 200},
                {x: 100, y: 150},
            ],
        };
        const polygons = [p1, p2];

        const out = combineFaces(polygons);

        verifyShape(out, [
            [12, [p1]],
            [4, [p1, p2]],
        ]);
    });

    it("Should handle common points and segments without overlap", () => {
        // https://puu.sh/ICorz/0cfbcdc937.png
        const p1: IFace<number> = {
            data: 1,
            polygon: [
                {x: 50, y: 50},
                {x: 150, y: 50},
                {x: 150, y: 150},
                {x: 50, y: 150},
            ],
        };
        const p2: IFace<number> = {
            data: 2,
            polygon: [
                {x: 150, y: 50},
                {x: 250, y: 50},
                {x: 250, y: 250},
                {x: 50, y: 250},
                {x: 50, y: 150},
                {x: 150, y: 150},
            ],
        };
        const polygons = [p1, p2];

        const out = combineFaces(polygons);

        verifyShape(out, [
            [4, [p1]],
            [6, [p2]],
        ]);
    });

    it("Should handle common points and segments", () => {
        // https://puu.sh/ICosB/a19511f580.png
        const p1: IFace<number> = {
            data: 1,
            polygon: [
                {x: 50, y: 50},
                {x: 150, y: 50},
                {x: 150, y: 150},
                {x: 50, y: 150},
            ],
        };
        const p2: IFace<number> = {
            data: 2,
            polygon: [
                {x: 150, y: 50},
                {x: 250, y: 50},
                {x: 250, y: 250},
                {x: 50, y: 250},
                {x: 50, y: 150},
                {x: 150, y: 130},
            ],
        };
        const polygons = [p1, p2];

        const out = combineFaces(polygons);

        verifyShape(out, [
            [4, [p1]],
            [7, [p2]],
            [3, [p1, p2]],
        ]);
    });

    it("Should handle multiple intersections in one point", () => {
        // https://puu.sh/ICotJ/382a193fc6.png
        const p1: IFace<number> = {
            data: 1,
            polygon: [
                {x: 100, y: 100},
                {x: 150, y: 150},
                {x: 100, y: 200},
                {x: 50, y: 150},
            ],
        };
        const p2: IFace<number> = {
            data: 2,
            polygon: [
                {x: 100, y: 50},
                {x: 250, y: 50},
                {x: 250, y: 250},
                {x: 100, y: 250},
            ],
        };
        const p3: IFace<number> = {
            data: 3,
            polygon: [
                {x: 75, y: 50},
                {x: 200, y: 200},
                {x: 125, y: 150},
            ],
        };
        const polygons = [p1, p2, p3];

        const out = combineFaces(polygons);

        verifyShape(out, [
            [3, [p1]],
            [8, [p2]],
            [3, [p3]],
            [4, [p1, p2]],
            [5, [p2, p3]],
            [4, [p1, p2, p3]],
        ]);
    });

    it("Should handle prevented intersections", () => {
        // Occurs when a segment turns out to be cut by another line in an earlier point than initially expected by another line

        // https://puu.sh/ICovP/7cff066e3e.png
        const p1: IFace<number> = {
            data: 1,
            polygon: [
                {x: 50, y: 50},
                {x: 150, y: 50},
                {x: 150, y: 200},
                {x: 50, y: 200},
            ],
        };
        const p2: IFace<number> = {
            data: 2,
            polygon: [
                {x: 80, y: 80},
                {x: 220, y: 180},
                {x: 80, y: 180},
            ],
        };
        const p3: IFace<number> = {
            data: 3,
            polygon: [
                {x: 180, y: 80},
                {x: 180, y: 160},
                {x: 100, y: 160},
            ],
        };
        const polygons = [p1, p2, p3];

        const out = combineFaces(polygons);

        verifyShape(out, [
            [9, [p1]],
            [5, [p2]],
            [4, [p3]],
            [6, [p1, p2]],
            [3, [p1, p3]],
            [4, [p1, p2, p3]],
            [4, [p2, p3]],
        ]);
    });

    it("Should handle complex intersections within an outer plane", () => {
        // https://puu.sh/ICoyp/7766411297.png
        const p1: IFace<number> = {
            data: 1,
            polygon: [
                {x: 50, y: 50},
                {x: 200, y: 50},
                {x: 200, y: 200},
                {x: 50, y: 200},
            ],
        };
        const p2: IFace<number> = {
            data: 2,
            polygon: [
                {x: 75, y: 75},
                {x: 175, y: 75},
                {x: 175, y: 175},
            ],
        };
        const p3: IFace<number> = {
            data: 3,
            polygon: [
                {x: 100, y: 100},
                {x: 150, y: 100},
                {x: 100, y: 150},
            ],
        };
        const p4: IFace<number> = {
            data: 4,
            polygon: [
                {x: 150, y: 100},
                {x: 150, y: 150},
                {x: 100, y: 150},
            ],
        };
        const polygons = [p1, p2, p3, p4];

        const out = combineFaces(polygons);

        verifyShape(out, [
            [12, [p1]],
            [6, [p1, p2]],
            [3, [p1, p3]],
            [3, [p1, p4]],
            [3, [p1, p2, p3]],
            [3, [p1, p2, p4]],
        ]);
    });
});

/**
 * Verifies that the given result satisfies the expected shape
 * @param result The output of the algoritm
 * @param expectedShape The number of expected vertices per face and the list of source faces making up the face
 */
function verifyShape<T>(
    result: IFace<IFace<T>[]>[],
    expectedShape: [number, IFace<T>[]][]
): void {
    expect(expectedShape.length).toEqual(result.length);

    let notFound: [number, IFace<T>[]][] = [];
    let remaining = [...result];

    for (let [points, sources] of expectedShape) {
        const found = remaining.find(
            ({data, polygon}) =>
                data.length == sources.length &&
                sources.every(source => data.includes(source)) &&
                polygon.length == points
        );

        if (found) remaining = remaining.filter(v => v != found);
        else notFound.push([points, sources]);
    }

    // Log all non found items
    for (let shape of notFound) {
        const [points, sources] = shape;
        const found = remaining.find(
            ({data, polygon}) =>
                data.length == sources.length &&
                sources.every(source => data.includes(source))
        );

        if (found) {
            remaining = remaining.filter(v => v != found);
            notFound = notFound.filter(v => v != shape);

            expect([found.polygon.length, found.data.map(({data}) => data)]).toEqual([
                shape[0],
                shape[1].map(({data}) => data),
            ]);
        }
    }

    for (let shape of notFound) {
        const found = remaining[0];

        remaining = remaining.slice(1);
        notFound = notFound.filter(v => v != shape);
        expect([found.polygon.length, found.data.map(({data}) => data)]).toEqual([
            shape[0],
            shape[1].map(({data}) => data),
        ]);
    }
}
