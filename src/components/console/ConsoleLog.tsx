import React, { useEffect, useContext } from "react"
import { styled } from "@mui/material/styles"
import { Console, Hook, Unhook } from "console-feed"
import ConsoleContext from "./ConsoleContext"
import AutoScroll from "../ui/AutoScroll"

const PREFIX = "ConsoleLog"

const classes = {
    root: `${PREFIX}-root`,
}

const StyledAutoScroll = styled(AutoScroll)(() => ({
    [`&.${classes.root}`]: {
        backgroundColor: "#242424",
        height: "calc(100vh - 7.05rem)",
    },
}))

export default function ConsoleLog() {
    const {
        logs,
        filter,
        searchKeywords,
        appendLog,
        autoScroll,
        setAutoScroll,
    } = useContext(ConsoleContext)

    useEffect(() => {
        const hooked =
            typeof window !== "undefined" &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Hook(window.console, appendLog as any, false)
        return () => {
            hooked && Unhook(hooked)
        }
    }, [])

    return (
        <StyledAutoScroll
            className={classes.root}
            height="calc(100vh - 7.05rem)"
            autoScroll={autoScroll}
            setAutoScroll={setAutoScroll}
        >
            <Console
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                logs={logs as any[]}
                variant="dark"
                logGrouping={true}
                filter={filter}
                searchKeywords={searchKeywords}
            />
        </StyledAutoScroll>
    )
}
