import React from "react"

export function svgPointerPoint(
    svg: SVGSVGElement,
    event: React.PointerEvent
): DOMPoint {
    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY
    const res = point.matrixTransform(svg.getScreenCTM().inverse())
    return res
}

export function closestPoint(
    pathNode: SVGPathElement,
    step: number,
    point: DOMPoint
): number {
    const pathLength = pathNode.getTotalLength()

    const distance2 = (p: DOMPoint) => {
        const dx = p.x - point.x
        const dy = p.y - point.y
        return dx * dx + dy * dy
    }

    let bestLength = 0
    let bestDistance = Infinity
    for (let scanLength = 0; scanLength <= pathLength; scanLength += step) {
        const scan = pathNode.getPointAtLength(scanLength)
        const scanDistance = distance2(scan)
        if (scanDistance < bestDistance) {
            bestLength = scanLength
            bestDistance = scanDistance
        }
    }
    return bestLength / pathLength
}

export function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0

    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    }
}

export function describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    large?: boolean
) {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)

    const largeArcFlag =
        large !== true && endAngle - startAngle <= 180 ? "0" : "1"

    const d = [
        "M",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
    ].join(" ")

    return d
}
