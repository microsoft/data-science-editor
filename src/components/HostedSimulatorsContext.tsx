import { Card, CardHeader, CardMedia } from "@mui/material"
import { styled } from "@mui/material/styles"
import React, {
    createContext,
    lazy,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { PACKET_PROCESS, PACKET_SEND } from "../../jacdac-ts/src/jdom/constants"
import { inIFrame } from "../../jacdac-ts/src/jdom/iframeclient"
import { Packet } from "../../jacdac-ts/src/jdom/packet"
import { randomDeviceId } from "../../jacdac-ts/src/jdom/random"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import useWindowEvent from "./hooks/useWindowEvent"
import CloseIcon from "@mui/icons-material/Close"
import {
    decodePacketMessage,
    PacketMessage,
} from "./makecode/iframebridgeclient"
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"
import Suspense from "./ui/Suspense"
import { UIFlags } from "../jacdac/providerbus"
import { Flags } from "../../jacdac-ts/src/jdom/flags"

const PREFIX = "HostedSimulatorsContext"

const classes = {
    cardContainer: `${PREFIX}-cardContainer`,
    card: `${PREFIX}-card`,
}

const Root = styled("div")(() => ({
    [`& .${classes.cardContainer}`]: {
        zIndex: 1100,
        position: "absolute",
        left: "5rem",
        top: "5rem",
    },

    [`& .${classes.card}`]: {
        "& .hostedcontainer": {
            position: "relative",
        },
        "& iframe": {
            border: "none",
            position: "relative",
            width: "100%",
            height: "100%",
        },
    },
}))

const Draggable = lazy(() => import("react-draggable"))

export interface HostedSimulatorDefinition {
    name: string
    url: string
    width: string
    height: string
}

interface HostedSimulator {
    id: string
    definition: HostedSimulatorDefinition
    devideId?: string
}

export interface HostedSimulatorsContextProps {
    addHostedSimulator: (definition: HostedSimulatorDefinition) => void
    removeHostedSimulator: (deviceId: string) => void
    clearHostedSimulators: () => void
    isHostedSimulator: (deviceId: string) => boolean
}

export const HostedSimulatorsContext =
    createContext<HostedSimulatorsContextProps>({
        addHostedSimulator: () => {},
        removeHostedSimulator: () => {},
        clearHostedSimulators: () => {},
        isHostedSimulator: () => false,
    })

HostedSimulatorsContext.displayName = "hostedSims"

export default function useHostedSimulators() {
    const ctx = useContext(HostedSimulatorsContext)
    if (!ctx) throw Error("HostedSimulatorContext not configured")
    return ctx
}

export function hostedSimulatorDefinitions(): HostedSimulatorDefinition[] {
    // TODO: support in iframe as well
    if (inIFrame()) return []
    return [
        {
            name: "micro:bit V2 Out-of-the-Box",
            url: "https://microsoft.github.io/pxt-jacdac/?tool=microbit-oob",
            width: "20rem",
            height: "17.5rem",
        },
        {
            name: "Azure IoT Uploader",
            url: "https://microsoft.github.io/pxt-jacdac/",
            width: "20rem",
            height: "12rem",
        },
        Flags.diagnostics && {
            name: "MakeCode Arcade multitool",
            url: "https://microsoft.github.io/pxt-jacdac/?tool=multitool",
            width: "25vw",
            height: "28.75vw",
        },
        UIFlags.localhost && {
            name: "Azure IoT Uploader (localhost)",
            url: "http://localhost:3232/index.html",
            width: "20rem",
            height: "12rem",
        },
        UIFlags.localhost && {
            name: "makecode serve (localhost)",
            url: "http://localhost:7000/",
            width: "20rem",
            height: "17.5rem",
        },
    ].filter(d => !!d)
}

function HostedSimulatorCard(props: { sim: HostedSimulator }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { sim } = props
    const { removeHostedSimulator } = useContext(HostedSimulatorsContext)
    const { definition, id } = sim
    const { url, name, width, height } = definition
    const origin = useMemo(() => new URL(url).origin, [url])

    const nodeRef = useRef<HTMLSpanElement>()
    const iframeRef = useRef<HTMLIFrameElement>()

    useEffect(
        () =>
            bus.subscribe([PACKET_SEND, PACKET_PROCESS], (pkt: Packet) => {
                const { sender } = pkt
                if (id === sender) return
                const msg: PacketMessage = {
                    type: "messagepacket",
                    channel: "jacdac",
                    broadcast: false,
                    data: pkt.toBuffer(),
                    sender: pkt.sender,
                }
                iframeRef.current?.contentWindow?.postMessage(msg, origin)
            }),
        [url]
    )

    const handleStop = () => removeHostedSimulator(sim.devideId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const draggableProps: any = {
        nodeRef,
    }

    return (
        <Suspense>
            <Draggable {...draggableProps}>
                <span ref={nodeRef} className={classes.cardContainer}>
                    <Card className={classes.card}>
                        <CardHeader
                            subheader={name}
                            action={
                                <IconButtonWithTooltip
                                    title="stop simulator"
                                    onClick={handleStop}
                                >
                                    <CloseIcon />
                                </IconButtonWithTooltip>
                            }
                        />
                        <CardMedia>
                            <div className="hostedcontainer" style={{ width }}>
                                <iframe
                                    id={sim.id}
                                    ref={iframeRef}
                                    title={name}
                                    src={`${url}#${id}`}
                                    style={{
                                        width,
                                        height,
                                        margin: 0,
                                        padding: 0,
                                    }}
                                />
                            </div>
                        </CardMedia>
                    </Card>
                </span>
            </Draggable>
        </Suspense>
    )
}

// eslint-disable-next-line react/prop-types
export const HostedSimulatorsProvider = ({ children }) => {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [simulators, setSimulators] = useState<HostedSimulator[]>([])

    const addHostedSimulator = (definition: HostedSimulatorDefinition) =>
        setSimulators([...simulators, { id: randomDeviceId(), definition }])
    const removeHostedSimulator = (deviceId: string) =>
        setSimulators([...simulators.filter(sim => sim.devideId !== deviceId)])
    const isHostedSimulator = (deviceId: string) =>
        simulators.some(sim => sim.devideId === deviceId)

    const handleMessage = (event: MessageEvent) => {
        const { data } = event
        const msg = data as PacketMessage
        const { channel, type, sender } = msg
        if (channel !== "jacdac" || type !== "messagepacket") return
        const sim = simulators.find(sim => sim.id === sender)
        if (!sim) return
        const pkts = decodePacketMessage(bus, msg)
        if (!pkts) return

        for (const pkt of pkts) {
            // sniff the device id from annouce packets
            if (pkt.isAnnounce && sim.devideId !== pkt.deviceIdentifier) {
                if (sim.devideId)
                    console.warn(
                        `hostedsim: device id changed from ${sim.devideId} to ${pkt.deviceIdentifier}`
                    )
                sim.devideId = pkt.deviceIdentifier
            }
            // send to native bus
            bus.sendPacketAsync(pkt)
            // send to javascript bus
            bus.processPacket(pkt)
        }
    }

    const clearHostedSimulators = () => setSimulators([])

    // iframe -> bus
    useWindowEvent("message", !!simulators.length && handleMessage, false, [
        simulators,
    ])

    return (
        <Root>
            <HostedSimulatorsContext.Provider
                value={{
                    addHostedSimulator,
                    removeHostedSimulator,
                    isHostedSimulator,
                    clearHostedSimulators,
                }}
            >
                {children}
                {simulators.map(sim => (
                    <HostedSimulatorCard key={sim.id} sim={sim} />
                ))}
            </HostedSimulatorsContext.Provider>
        </Root>
    )
}
