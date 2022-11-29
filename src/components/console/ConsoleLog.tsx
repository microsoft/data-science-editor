import React, { useEffect, useContext, CSSProperties } from "react"
import { Console, Hook, Unhook } from "console-feed"
import ConsoleContext from "./ConsoleContext"
import AutoScroll from "../ui/AutoScroll"
import DarkModeContext from "../ui/DarkModeContext"

export default function ConsoleLog(props: { hook?: boolean; height?: string }) {
    const { hook, height } = props
    const {
        logs,
        filter,
        searchKeywords,
        appendLog,
        autoScroll,
        setAutoScroll,
    } = useContext(ConsoleContext)
    const { darkMode } = useContext(DarkModeContext)

    useEffect(() => {
        const hooked =
            hook &&
            typeof self !== "undefined" &&
            self.console &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Hook(self.console, appendLog as any, false)
        return () => {
            hooked && Unhook(hooked)
        }
    }, [hook])

    if (!darkMode) return null

    console.log({ darkMode })
    const style: CSSProperties = {
        backgroundColor: darkMode === "dark" ? "#1d1d1d" : "#fff",
        height: "calc(100vh - 11.05rem)",
        fontWeight: "600",
        minWidth: "22rem",
    }
    return (
        <AutoScroll
            style={style}
            height={height || "calc(100vh - 11.05rem)"}
            autoScroll={autoScroll}
            setAutoScroll={setAutoScroll}
        >
            <Console
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                logs={logs as any[]}
                variant={darkMode}
                logGrouping={true}
                filter={filter}
                styles={{
                    BASE_FONT_SIZE: "13px",
                    LOG_INFO_COLOR: "rgb(89,136,243)",
                }}
                linkifyOptions={{
                    defaultProtocol: "https",
                    nl2br: false,
                    rel: "noopened",
                    tagName: "span",
                    validate: true,
                }}
                searchKeywords={searchKeywords}
            />
        </AutoScroll>
    )
}
