import React, { createContext, useCallback, useEffect, useMemo, useState } from "react"
import {
    LoggerCmd,
    LoggerPriority,
    SRV_LOGGER,
    SRV_JACSCRIPT_MANAGER,
    JacscriptManagerCmd,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { PACKET_REPORT } from "../../../jacdac-ts/src/jdom/constants"
import { Packet } from "../../../jacdac-ts/src/jdom/packet"
import { UIFlags } from "../../jacdac/providerbus"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"
import useAnalytics from "../hooks/useAnalytics"
import useConsoleSerial from "./useConsoleSerial"

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

export interface Message {
    // The log method
    method: Methods
    // The arguments passed to console API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]
}

export type SourceMap = Record<string, number[]>
export interface ConsoleProps {
    logs: Message[]
    appendLog: (log: Message) => void
    clear: () => void

    sourceMap?: SourceMap
    setSourceMap: (sc: SourceMap) => void

    autoScroll?: boolean
    setAutoScroll: (newValue: boolean) => void

    filter?: Methods[]
    searchKeywords?: string
    setSearchKeywords: (kw: string) => void

    connected?: boolean
    connect: () => Promise<void>
    disconnect: () => Promise<void>
}

const ConsoleContext = createContext<ConsoleProps>({
    logs: [],
    appendLog: () => {},
    clear: () => {},
    setSourceMap: () => {},
    setSearchKeywords: () => {},
    connect: async () => {},
    disconnect: async () => {},
    setAutoScroll: () => {},
})
ConsoleContext.displayName = "console"

export default ConsoleContext
const MAX_MESSAGES = 5000
const MAX_MESSAGES_SPILL = 500

const methods = {
    [LoggerPriority.Debug]: "debug",
    [LoggerPriority.Error]: "error",
    [LoggerPriority.Log]: "log",
    [LoggerPriority.Silent]: "",
    [LoggerPriority.Warning]: "warn"
}


function useJacdacLogger(appendLog: (log: Message) => void) {
    const bus = useBus()
    useEffect(
        () =>
            bus.subscribe(PACKET_REPORT, (pkt: Packet) => {
                if (pkt.serviceClass === SRV_LOGGER && pkt.isReport) {
                    const priority =
                        LoggerPriority.Debug +
                        (pkt.serviceCommand - LoggerCmd.Debug)
                    if (priority === LoggerPriority.Silent) return

                    const { device } = pkt
                    const { shortId } = device
                    const content = pkt.jdunpack<[string]>("s")[0]
                    const prefix = content.startsWith(`${shortId}.`)
                        ? ""
                        : `${shortId}> `
                    const message = `${prefix}${content.trimEnd()}`
                    const method = methods[priority]
                    appendLog({
                        method,
                        data: [message]
                    })
                }
            }),
        [appendLog])
}

function useJacscriptManagerLogger(appendLog: (log: Message) => void) {
    const bus = useBus()
    useEffect(
        () =>
            bus.subscribe(PACKET_REPORT, (pkt: Packet) => {
                if (
                    pkt.serviceClass === SRV_JACSCRIPT_MANAGER &&
                    pkt.isReport &&
                    pkt.serviceCommand === JacscriptManagerCmd.LogMessage
                ) {
                    const { device } = pkt
                    const { shortId } = device
                    const [counter, flags, content] =
                        pkt.jdunpack<[number, number, string]>("u8 u8 s")
                    const prefix = content.startsWith(`${shortId}.`)
                        ? ""
                        : `${shortId}> `
                    const message = `${prefix}${content.trimEnd()}`
                    appendLog({
                        method: "log",
                        data: [message]
                    })
                }
            }),
        []
    )
}

function useFilter() {
    const bus = useBus()
    const minLoggerPriority = useChange(bus, _ => _.minLoggerPriority)
    return useMemo(() => {
        const filter: Methods[] = []
        if (minLoggerPriority <= LoggerPriority.Debug) {
            filter.push("debug")
            filter.push("clear")
        }
        if (minLoggerPriority <= LoggerPriority.Log) {
            filter.push("log")
            filter.push("info")
            filter.push("result")
            filter.push("table")
            filter.push("time")
            filter.push("timeEnd")
            filter.push("count")
        }
        if (minLoggerPriority <= LoggerPriority.Warning) {
            filter.push("warn")
            filter.push("assert")
            filter.push("command")
        }
        if (minLoggerPriority <= LoggerPriority.Error) filter.push("error")
        if (minLoggerPriority > LoggerPriority.Error) filter.push("clear")
        return filter
    }, [minLoggerPriority])
}

export function serializeLogs(logs: Message[]) {
    return logs
        ?.map(
            ({ method, data }) =>
                `${method !== "log" ? method : ""} ${data[0]}${data
                    .slice(1)
                    .map(d => "\n" + JSON.stringify(d))
                    .join("")}`
        )
        .join("\n")
}

// eslint-disable-next-line react/prop-types
export const ConsoleProvider = ({ children }) => {
    const [searchKeywords, setSearchKeywords] = useState<string>()
    const [logs, setLogs] = useState([])
    const [autoScroll, setAutoScroll] = useState(true)
    const [sourceMap, setSourceMap] = useState<SourceMap>()
    const { connected, connect, disconnect } = useConsoleSerial(sourceMap)
    const { trackTrace } = useAnalytics()
    const filter = useFilter()

    const appendLog = useCallback((log: Message) => {
        if (UIFlags.consoleinsights) trackTrace(log.data[0], log.method as any)
        setLogs(currLogs => [
            ...(currLogs.length > MAX_MESSAGES
                ? currLogs.slice(-MAX_MESSAGES_SPILL)
                : currLogs),
            log,
        ])
    }, [])

    useJacdacLogger(appendLog)
    useJacscriptManagerLogger(appendLog)

    const clear = () => {
        setLogs([])
        setAutoScroll(true)
    }

    return (
        <ConsoleContext.Provider
            value={{
                logs,
                appendLog,
                clear,
                sourceMap,
                setSourceMap,
                filter,
                searchKeywords,
                setSearchKeywords,
                connected,
                connect,
                disconnect,
                autoScroll,
                setAutoScroll,
            }}
        >
            {children}
        </ConsoleContext.Provider>
    )
}
