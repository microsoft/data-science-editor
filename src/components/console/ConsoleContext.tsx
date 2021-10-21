import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import {
    LoggerCmd,
    LoggerPriority,
    SRV_LOGGER,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { PACKET_REPORT } from "../../../jacdac-ts/src/jdom/constants"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"
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

function useJacdacLogger() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    useEffect(
        () =>
            bus.subscribe(PACKET_REPORT, (pkt: Packet) => {
                if (pkt.serviceClass === SRV_LOGGER && pkt.isReport) {
                    const priority =
                        LoggerPriority.Debug +
                        (pkt.serviceCommand - LoggerCmd.Debug)
                    const { device } = pkt
                    const { shortId } = device
                    const content = pkt.jdunpack<[string]>("s")[0]
                    const message = `${shortId}> ${content.trimEnd()}`
                    switch (priority) {
                        case LoggerPriority.Debug:
                            console.debug(message)
                            break
                        case LoggerPriority.Log:
                            console.log(message)
                            break
                        case LoggerPriority.Warning:
                            console.warn(message)
                            break
                        case LoggerPriority.Error:
                            console.error(message)
                            break
                    }
                }
            }),
        []
    )
}

function useFilter() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
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

// eslint-disable-next-line react/prop-types
export const ConsoleProvider = ({ children }) => {
    const [searchKeywords, setSearchKeywords] = useState<string>()
    const [logs, setLogs] = useState([])
    const [autoScroll, setAutoScroll] = useState(true)
    const [sourceMap, setSourceMap] = useState<SourceMap>()
    const { connected, connect, disconnect } = useConsoleSerial(sourceMap)
    const filter = useFilter()
    useJacdacLogger()

    const appendLog = log =>
        setLogs(currLogs => [
            ...(currLogs.length > MAX_MESSAGES
                ? currLogs.slice(-MAX_MESSAGES_SPILL)
                : currLogs),
            log,
        ])
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
