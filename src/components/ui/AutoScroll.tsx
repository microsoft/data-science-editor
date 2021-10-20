// bug fix: https://github.com/brianmcallister/react-auto-scroll/issues/37
import React, { ReactNode, useEffect, useRef, useState } from "react"

export default function AutoScroll(props: {
    className?: string
    children: ReactNode
    height: string,
    autoScroll?: boolean
    setAutoScroll?: (newValue: boolean) => void
}) {
    const { children, height, className, autoScroll, setAutoScroll } = props
    const containerElement = useRef<HTMLDivElement>(null)
    const style = {
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
            style={style}
        >
            {children}
        </div>
    )
}
