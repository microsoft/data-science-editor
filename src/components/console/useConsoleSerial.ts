import { useContext, useEffect, useState } from "react"
import AppContext from "../AppContext"
import { isWebSerialSupported } from "../../../jacdac-ts/src/jdom/transport/webserial"
import { SourceMap } from "./ConsoleContext"
import useSnackbar from "../hooks/useSnackbar"

function resolveAddr(sourceMap: Record<string, number[]>, addr: number) {
    const offsets = [-2, -4, 0]
    let hit = ""
    let bestOffset: number = undefined
    if (addr == 2) return "<bottom>"
    for (const fn of Object.keys(sourceMap)) {
        const vals = sourceMap[fn]
        for (let i = 0; i < vals.length; i += 3) {
            const lineNo = vals[i]
            const startA = vals[i + 1]
            const endA = startA + vals[i + 2]
            if (addr + 10 >= startA && addr - 10 <= endA) {
                for (const off of offsets) {
                    if (startA <= addr + off && addr + off <= endA) {
                        if (
                            !hit ||
                            offsets.indexOf(off) < offsets.indexOf(bestOffset)
                        ) {
                            hit = fn + "(" + lineNo + ")"
                            bestOffset = off
                        }
                    }
                }
            }
        }
    }
    return hit
}

function expandStackTrace(
    sourceMap: Record<string, number[]>,
    stackTrace: string
) {
    return stackTrace.replace(/(^| )PC:0x([A-F0-9]+)/g, (full, space, num) => {
        const n = resolveAddr(sourceMap, parseInt(num, 16)) || "???"
        return " " + n + " (0x" + num + ")"
    })
}

export default function useConsoleSerial(sourceMap: SourceMap) {
    const supported = isWebSerialSupported()
    const { setError } = useSnackbar()
    const [port, setPort] = useState<SerialPort>()
    const connected = !!port

    // register disconnect
    useEffect(() => {
        if (!supported) return

        const handleDisconnect = (ev: Event) => {
            const other = ev.target as SerialPort
            if (port === other) {
                console.debug(`serial console: disconnected`)
                setPort(undefined)
            }
        }
        navigator.serial.addEventListener("disconnect", handleDisconnect, false)
        return () =>
            navigator.serial.removeEventListener("disconnect", handleDisconnect)
    })

    // request device
    const connect = async () => {
        try {
            const port = await navigator.serial.requestPort({})
            await port.open({ baudRate: 115200 })
            let lastChunk = ""
            const appendStream = new WritableStream<string>({
                write(newChunk) {
                    const chunk =
                        // eslint-disable-next-line no-control-regex
                        (lastChunk + newChunk).replace(/\x1b\[\d+(;\d+)?m/g, "")
                    const lines = chunk.split("\n")
                    lastChunk = lines.pop()
                    lines
                        .filter(l => !!l)
                        .map(l => l.replace(/DMESG:/g, ""))
                        .map(line =>
                            sourceMap ? expandStackTrace(sourceMap, line) : line
                        )
                        .forEach(line => {
                            const m = /^\s*(W|I|E)\s+\(\d+\)\s*/.exec(line)
                            const level = m?.[1]
                            switch (level) {
                                case "W":
                                    console.warn(line.slice(m[0].length))
                                    break
                                case "I":
                                    console.info(line.slice(m[0].length))
                                    break
                                case "E":
                                    console.error(line.slice(m[0].length))
                                    break
                                default:
                                    console.log(line)
                                    break
                            }
                        })
                },
            })
            port.readable
                .pipeThrough(new TextDecoderStream())
                .pipeTo(appendStream)
            setPort(port)
            console.debug(`serial console: connected`)
        } catch (e) {
            setError(e)
            setPort(undefined)
        }
    }

    const disconnect = async () => {
        const p = port
        if (p) {
            console.log(`serial console: disconnect`)
            try {
                await p.close()
            } catch (e) {
                setError(e)
            }
        }
        setPort(undefined)
    }

    // clean up always
    useEffect(() => {
        if (port)
            return () => {
                disconnect()
            }
    }, [port])

    if (!supported) return {}

    return {
        connected,
        connect,
        disconnect,
    }
}
