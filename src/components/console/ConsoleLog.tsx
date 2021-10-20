import React, { useEffect, useContext } from "react"
import { Console, Hook, Unhook } from "console-feed"
import ConsoleContext from "./ConsoleContext"
import { createStyles, makeStyles } from "@material-ui/core"
import AutoScroll from "../ui/AutoScroll"

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            backgroundColor: "#242424",
            height: "calc(100vh - 7.05rem)",
        },
    })
)

export default function ConsoleLog() {
    const { logs, appendLog, autoScroll, setAutoScroll } =
        useContext(ConsoleContext)
    const classes = useStyles()

    useEffect(() => {
        const hooked =
            typeof window !== "undefined" &&
            Hook(window.console, appendLog, false)
        return () => {
            hooked && Unhook(hooked)
        }
    }, [])

    return (
        <AutoScroll
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
            />
        </AutoScroll>
    )
}
