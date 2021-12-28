import {useEffect, useState} from "react";

export function getBodySize(): {
    width?: number;
    height?: number;
} {
    return {
        width: window.document.body.clientWidth,
        height: window.document.body.clientHeight,
    };
}

export function useBodySize(): {
    width?: number;
    height?: number;
} {
    const [size, setSize] = useState(getBodySize());
    useEffect(() => {
        const listener = () => {
            setSize(getBodySize());
        };

        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, []);

    return size;
}
