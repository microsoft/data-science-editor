import { useState } from "react"
import useAnimationFrame from "./useAnimationFrame"

export default function useThrottledValue(
    value: number,
    maxRate: number,
    maxCycles = 2
) {
    const [actual, setActual] = useState<number>(value)

    let animated = actual
    useAnimationFrame(
        time => {
            // no valid rate
            if (isNaN(maxRate) || isNaN(animated)) {
                setActual(value)
                return false
            }

            // increment towards value
            const dt = time / 1000 // s
            const error = value - animated
            const maxError = maxRate * dt // deg
            let active = true
            animated += Math.sign(error) * Math.min(Math.abs(error), maxError)
            // close to goal, finish animation
            if (Math.abs(value - animated) / maxRate < 0.01) {
                animated = value
                active = false
            }
            // very far from goal, get closer immediately
            if (!isNaN(maxCycles)) {
                const maxErrorRange = maxRate * maxCycles
                animated = Math.max(
                    value - maxErrorRange,
                    Math.min(value + maxErrorRange, animated)
                )
            }
            // store and update ui
            setActual(animated)
            return active
        },
        [value, maxRate, maxCycles]
    )

    return actual
}
