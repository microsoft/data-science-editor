import { CSSProperties } from "@mui/material/styles"
import React, { ReactNode } from "react"

export default function SvgWidget(props: {
    width: number
    height?: number
    size?: string
    role?: string
    title?: string
    viewBox?: string
    tabIndex?: number
    background?: string
    svgRef?: React.MutableRefObject<SVGSVGElement>
    children: ReactNode
}) {
    const {
        width,
        height,
        size = "100%",
        background,
        children,
        role,
        title,
        viewBox,
        tabIndex,
        svgRef,
    } = props
    const h = height || width
    const aspectRatio = width / height
    const vertical = aspectRatio < 1

    return (
        <div
            style={{
                position: "relative",
                height: vertical ? size : undefined,
                width: vertical ? undefined : size,
            }}
        >
            <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                tabIndex={tabIndex}
                viewBox={viewBox || `0 0 ${width} ${h}`}
                aria-label={title}
                style={{
                    height: vertical ? "100%" : undefined,
                    width: vertical ? undefined : "100%",
                }}
                role={role || "group"}
            >
                {background && (
                    <rect
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                        fill={background}
                        rx={1}
                        ry={1}
                    />
                )}
                {children}
            </svg>
        </div>
    )
}
