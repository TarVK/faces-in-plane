import {useEffect, useState} from "react";

/**
 * A hook to returns the size of the window, can be used to listen for size changes
 * @returns The window's size
 */
export const useWindowSize = () => {
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    useEffect(() => {
        const resizeListener = () => {
            setSize({width: window.innerWidth, height: window.innerHeight});
        };
        window.addEventListener("resize", resizeListener);

        return () => {
            window.removeEventListener("resize", resizeListener);
        };
    });

    return size;
};
