import { useEffect, useState } from "react";

export default function usePathPosition(
    pathRef: SVGPathElement,
    ratio: number) {
    const [position, setPosition] = useState<[number, number]>();
    useEffect(() => {
        if (pathRef) {
            const length = pathRef.getTotalLength();
            const nratio = Math.max(0, Math.min(1, ratio));
            const distance = length * nratio;
            const pos = pathRef.getPointAtLength(distance)
            setPosition([pos.x, pos.y]);
        }
    }, [pathRef, ratio]);
    return position;
}