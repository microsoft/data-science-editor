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
        backgroundColor: "#1d1d1d",
        height: "calc(100vh - 11.05rem)",
    },
}))

export default function ConsoleLog(props: { hook?: boolean }) {
    const { hook } = props
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
            hook &&
            typeof self !== "undefined" &&
            self.console &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Hook(self.console, appendLog as any, false)
        return () => {
            hooked && Unhook(hooked)
        }
    }, [hook])

    return (
        <StyledAutoScroll
            className={classes.root}
            height="calc(100vh - 11.05rem)"
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
