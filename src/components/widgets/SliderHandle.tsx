import React, { CSSProperties, SVGAttributes, useRef } from "react";
import useArrowKeys from "../hooks/useArrowKeys";
import usePathPosition from "../hooks/useSvgPathPosition";
import { closestPoint, svgPointerPoint } from "./svgutils";

export default function SliderHandle(props: {
    pathRef: SVGPathElement,
    value: number,
    valueText: string,
    label: string,
    min: number,
    max: number,
    step: number,
    onValueChange?: (newValue: number) => void,
} & SVGAttributes<SVGCircleElement>) {
    const { pathRef, value, valueText, label, min, max, step, onValueChange, ...others } = props;
    const handleRef = useRef<SVGCircleElement>()
    const pos = usePathPosition(pathRef, (max - value) / (max - min));
    const handleMove = (newValue: number) => {
        onValueChange(Math.max(min, Math.min(max, newValue)));
    }

    const onKeyDown = useArrowKeys({
        onLeft: () => handleMove(value - step),
        onRight: () => handleMove(value + step),
        symmetric: true,
    })

    // nothing to see here
    if (!onValueChange || !pos) {
        return null;
    }

    return <circle
        ref={handleRef}
        cx={pos[0]}
        cy={pos[1]}
        className={"clickeable"}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuetext={valueText}
        aria-valuemin={min}
        aria-valuemax={max}
        onKeyDown={onKeyDown}
        {...others}
    />
}