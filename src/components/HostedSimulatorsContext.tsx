import {
    Card,
    CardContent,
    CardHeader,
    createStyles,
    makeStyles,
} from "@material-ui/core"
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
import Packet from "../../jacdac-ts/src/jdom/packet"
import { randomDeviceId } from "../../jacdac-ts/src/jdom/random"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import useWindowEvent from "./hooks/useWindowEvent"
import CloseIcon from "@material-ui/icons/Close"
import {
    decodePacketMessage,
    PacketMessage,
} from "./makecode/iframebridgeclient"
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"
import Suspense from "./ui/Suspense"

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

const HostedSimulatorsContext = createContext<HostedSimulatorsContextProps>({
    addHostedSimulator: () => {},
    removeHostedSimulator: () => {},
    clearHostedSimulators: () => {},
    isHostedSimulator: () => false,
})

HostedSimulatorsContext.displayName = "hostedSims"

export default HostedSimulatorsContext

export function hostedSimulatorDefinitions(): HostedSimulatorDefinition[] {
    // TODO: support in iframe as well
    if (inIFrame()) return []
    return [
        {
            name: "Azure IoT Uploader",
            url: "https://microsoft.github.io/pxt-jacdac/",
            width: "20rem",
            height: "14rem",
        },
    ]
}

const useStyles = makeStyles(() =>
    createStyles({
        cardContainer: {
            zIndex: 10000,
            position: "absolute",
            left: "25rem",
            top: "25rem",
        },
        card: {
            "& .hostedcontainer": {
                position: "relative",
                width: "20rem",
            },
            "& iframe": {
                border: "none",
                position: "relative",
                width: "100%",
                height: "100%",
            },
        },
    })
)

function HostedSimulatorCard(props: { sim: HostedSimulator }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { sim } = props
    const { removeHostedSimulator } = useContext(HostedSimulatorsContext)
    const { definition, id } = sim
    const { url, name, width, height } = definition
    const origin = useMemo(() => new URL(url).origin, [url])
    const classes = useStyles()
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
                        <CardContent>
                            <div className="hostedcontainer">
                                <iframe
                                    id={sim.id}
                                    ref={iframeRef}
                                    title={name}
                                    src={`${url}#${id}`}
                                    style={{ width, height }}
                                />
                            </div>
                        </CardContent>
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
    )
}
