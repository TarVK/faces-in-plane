import {Link} from "@fluentui/react";
import React, {FC} from "react";

export const Info: FC = () => (
    <>
        <p>
            This website is a demonstration for a polygon intersection algorithm I
            designed as part of a project for the Geometric Algorithms course (2IMA15)
            taught at the{" "}
            <Link href="https://www.tue.nl/en/">
                Technological University of Eindhoven
            </Link>
            .
        </p>
        <p>
            The algorithm takes a set of indepedent simple polygons (polygons without
            holes or self-intersections) and outputs indepedent faces that these polygons
            create when being part of the same plane.
        </p>
        <p>
            You can test the algorithm by first drawing some polygons in the left section
            and then pressing the "Combine polygons" button at the top of the screen. The
            algorithm is known to have some robustness issues, which means that it may not
            always compute the correct results because of rounding errors.
        </p>
        <p>
            The code is visible on{" "}
            <Link href="https://github.com/TarVK/faces-in-plane">
                Github.com/TarVK/faces-in-plane
            </Link>
            . Additionally a PDF is provided which explains how the algorithm operates:{" "}
            <Link href="https://github.com/TarVK/faces-in-plane/blob/main/explanation/algorithm.pdf">
                Algorithm.pdf
            </Link>
            .
        </p>
        <p>
            This website including the polygon editor was also created from scratching
            using some libraries such as <Link href="https://reactjs.org/">React</Link>,{" "}
            <Link href="https://microsoft.github.io/monaco-editor/">Monaco</Link> and{" "}
            <Link href="https://developer.microsoft.com/en-us/fluentui#/">Fluent-UI</Link>{" "}
            to simplify things.
        </p>
    </>
);
