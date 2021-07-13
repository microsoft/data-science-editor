import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import Packet from "../../jacdac-ts/src/jdom/packet"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import { CHANGE, PROGRESS } from "../../jacdac-ts/src/jdom/constants"
import Trace from "../../jacdac-ts/src/jdom/trace"
import TracePlayer from "../../jacdac-ts/src/jdom/traceplayer"
import TraceRecorder from "../../jacdac-ts/src/jdom/tracerecorder"
import TraceView, { TracePacketProps } from "../../jacdac-ts/src/jdom/traceview"
import useLocalStorage from "./hooks/useLocalStorage"

export interface PacketsProps {
    trace: Trace
    packets: TracePacketProps[]
    selectedPacket: Packet
    setSelectedPacket: (pkt: Packet) => void
    clearPackets: () => void
    clearBus: () => void
    filter: string
    setFilter: (filter: string) => void
    replayTrace: Trace
    setReplayTrace: (trace: Trace) => void
    recording: boolean
    toggleRecording: () => void
    tracing: boolean
    toggleTracing: () => void
    paused: boolean
    setPaused: (p: boolean) => void
    progress: number
    timeRange: number[] // [start, end]
    toggleTimeRange: () => void
    setTimeRange: (range: number[]) => void
}

const PacketsContext = createContext<PacketsProps>({
    trace: undefined,
    packets: [],
    selectedPacket: undefined,
    setSelectedPacket: () => {},
    clearPackets: () => {},
    clearBus: () => {},
    filter: "",
    setFilter: () => {},
    replayTrace: undefined,
    setReplayTrace: () => {},
    recording: false,
    toggleRecording: () => {},
    tracing: false,
    toggleTracing: () => {},
    paused: false,
    setPaused: () => {},
    progress: undefined,
    timeRange: undefined,
    toggleTimeRange: () => {},
    setTimeRange: () => {},
})
PacketsContext.displayName = "packets"

export default PacketsContext

const DEFAULT_PACKET_FILTER = "announce:false reset-in:false min-priority:false"

// eslint-disable-next-line react/prop-types
export const PacketsProvider = ({ children }) => {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [filter, _setFilter] = useLocalStorage(
        "packetfilter",
        DEFAULT_PACKET_FILTER
    )

    const recorder = useRef<TraceRecorder>(undefined)
    const view = useRef<TraceView>(undefined)
    const player = useRef<TracePlayer>(undefined)

    const [packets, setPackets] = useState<TracePacketProps[]>([])
    const [selectedPacket, setSelectedPacket] = useState<Packet>(undefined)
    const [progress, setProgress] = useState(0)
    const [timeRange, setTimeRange] = useState<number[]>(undefined)
    const [recording, setRecording] = useState(false)
    const [trace, setTrace] = useState<Trace>(undefined)
    const [replayTrace, _setReplayTrace] = useState<Trace>(undefined)
    const [tracing, setTracing] = useState(false)
    const [paused, _setPaused] = useState(false)

    const clearPackets = () => {
        setSelectedPacket(undefined)
        setProgress(undefined)
        setTimeRange(undefined)
        player.current.stop()
        recorder.current.stop()
        view.current.clear()
        // don't clear the bus, it's too disrupting
        //bus.clear();
    }
    const clearBus = () => {
        clearPackets()
        bus.clear()
    }
    const setReplayTrace = async (trace: Trace) => {
        clearPackets()
        player.current.trace = trace
    }
    const toggleRecording = () => {
        if (recorder.current.recording) {
            player.current.trace = recorder.current.stop()
        } else {
            recorder.current.start()
            player.current.trace = undefined
            setProgress(undefined)
        }
    }
    const toggleTracing = async () => {
        console.log(`player toggle running ${player.current.running}`)
        if (player.current.running) {
            player.current.stop()
        } else {
            clearPackets()
            bus.clear() // clear all devices
            player.current.start()
        }
    }
    const toggleTimeRange = () => {
        if (timeRange) {
            setTimeRange(undefined)
        } else {
            setTimeRange([
                view.current.trace.startTimestamp,
                view.current.trace.endTimestamp,
            ])
        }
    }
    const setFilter = (f: string) => {
        _setFilter(f)
    }
    const setPaused = (p: boolean) => {
        _setPaused(p)
        if (view.current) view.current.paused = p
    }
    // views
    useEffect(() => {
        recorder.current = new TraceRecorder(bus)
        view.current = new TraceView(bus, filter)
        player.current = new TracePlayer(bus)

        setTrace(view.current.trace)

        view.current.mount(
            view.current.subscribe(CHANGE, () => {
                setPackets(view.current.filteredPackets)
                setTrace(view.current.trace)
            })
        )
        recorder.current.mount(
            recorder.current.subscribe(CHANGE, () => {
                setRecording(recorder.current.recording)
            })
        )
        player.current.mount(
            player.current.subscribe(CHANGE, async () => {
                setTracing(player.current.running)
                _setReplayTrace(player.current.trace)
                if (player.current.trace) await bus.stop()
                else {
                    if (!recorder.current.trace)
                        bus.clear()
                    await bus.start()
                }
            })
        )
        player.current.mount(
            player.current.subscribe(PROGRESS, () =>
                setProgress(player.current.progress)
            )
        )

        return () => {
            recorder.current.unmount()
            view.current.unmount()
            player.current.unmount()
        }
    }, [])
    // update filter in the view
    useEffect(() => {
        let f = filter
        if (timeRange?.[0] !== undefined) f += ` after:${timeRange[0]}`
        if (timeRange?.[1] !== undefined) f += ` before:${timeRange[1]}`
        view.current.filter = f
    }, [filter, timeRange])

    return (
        <PacketsContext.Provider
            value={{
                trace,
                packets,
                clearPackets,
                clearBus,
                selectedPacket,
                setSelectedPacket,
                filter,
                setFilter,
                replayTrace,
                setReplayTrace,
                recording,
                toggleRecording,
                tracing,
                toggleTracing,
                paused,
                setPaused,
                progress,
                timeRange,
                setTimeRange,
                toggleTimeRange,
            }}
        >
            {children}
        </PacketsContext.Provider>
    )
}
