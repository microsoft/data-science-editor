import { useState } from "react";
import useAnimationFrame from "./useAnimationFrame";

export default function useThrottledValue(value: number, maxRate: number) {
    const [actual, setActual] = useState<number>(value);

    let animated = actual;
    useAnimationFrame(time => {
        // no valid rate
        if (isNaN(maxRate) || isNaN(animated)) {
            setActual(value);
            return false;
        }

        // increment towards value
        const dt = time / 1000; // s
        const error = value - animated;
        const maxError = maxRate * dt; // deg
        let active = true;
        animated += Math.sign(error) * Math.min(Math.abs(error), maxError)
        if (Math.abs(value - animated) / maxRate < 0.01) {
            animated = value;
            active = false;
        }
        setActual(animated);
        return active;
    }, [value, maxRate]);

    return actual;
}