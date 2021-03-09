import { DependencyList, useEffect, useRef } from "react";

export default function useAnimationFrame(callback: (time: number) => boolean, deps?: DependencyList) {
    const requestRef = useRef<number>();
    const previousTimeRef = useRef<number>();

    const animate = (time: number) => {
        let active = true;
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            active = callback(deltaTime)
        }
        previousTimeRef.current = time;
        if (active)
            requestRef.current = requestAnimationFrame(animate);
        else // we're done
            requestRef.current = undefined;
    }

    useEffect(() => {
        previousTimeRef.current = undefined;
        requestRef.current = requestAnimationFrame(animate);
        return () => requestRef.current !== undefined
            && cancelAnimationFrame(requestRef.current);
    }, deps || []);
}