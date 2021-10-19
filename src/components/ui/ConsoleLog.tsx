import React, { useState, useEffect, useContext } from "react"
import { Console, Hook, Unhook } from "console-feed"
import DarkModeContext from "../../components/ui/DarkModeContext"
import { createStyles, makeStyles } from "@material-ui/core"

export type Methods =
    | "log"
    | "debug"
    | "info"
    | "warn"
    | "error"
    | "table"
    | "clear"
    | "time"
    | "timeEnd"
    | "count"
    | "assert"
    | "command"
    | "result"

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            backgroundColor: "#000",
            overflowY: "auto",
            maxHeight: "100vh",
        },
    })
)

/**
 * SSR only log view, delay load!
 * @param props
 * @returns
 */
export default function ConsoleLog(props: {
    filter?: Methods[]
    searchKeywords?: string
}) {
    const { ...rest } = props
    const { darkMode } = useContext(DarkModeContext)
    const classes = useStyles()
    const [logs, setLogs] = useState([])

    useEffect(() => {
        const hooked =
            typeof window !== "undefined" &&
            Hook(
                window.console,
                log => setLogs(currLogs => [...currLogs, log]),
                false
            )
        return () => {
            hooked && Unhook(hooked)
        }
    }, [])

    return (
        <div className={classes.root}>
            <Console
                logs={logs}
                variant={darkMode}
                logGrouping={true}
                {...rest}
            />
        </div>
    )
}
