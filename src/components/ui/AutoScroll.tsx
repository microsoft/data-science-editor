// bug fix: https://github.com/brianmcallister/react-auto-scroll/issues/37
import React, { CSSProperties, ReactNode, useEffect, useRef } from "react"

export default function AutoScroll(props: {
    className?: string
    children: ReactNode
    height: string
    autoScroll?: boolean
    setAutoScroll?: (newValue: boolean) => void
    style?: CSSProperties
}) {
    const { children, height, className, autoScroll, setAutoScroll, style } =
        props
    const containerElement = useRef<HTMLDivElement>(null)
    const css = {
        ...(style || {}),
        height,
        overflow: "auto",
        scrollBehavior: "auto",
        pointerEvents: "auto",
    } as const

    const onWheel = () => {
        const { current } = containerElement
        if (current) {
            setAutoScroll(
                current.scrollTop + current.offsetHeight ===
                    current.scrollHeight
            )
        }
    }

    useEffect(() => {
        if (!autoScroll) {
            return
        }
        const { current } = containerElement
        if (current) current.scrollTop = current.scrollHeight
    }, [children, containerElement, autoScroll])

    return (
        <div
            className={className}
            onWheel={onWheel}
            ref={containerElement}
            style={css}
        >
            {children}
        </div>
    )
}
