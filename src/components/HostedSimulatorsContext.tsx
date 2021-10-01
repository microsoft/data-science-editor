import { createStyles, makeStyles } from "@material-ui/core"
import React, { createContext, useContext, useEffect, useRef } from "react"
import { useId } from "react-use-id-hook"
import JDBus from "../../jacdac-ts/src/jdom/bus"
import JDClient from "../../jacdac-ts/src/jdom/client"
import {
    CHANGE,
    PACKET_PROCESS,
    PACKET_SEND,
} from "../../jacdac-ts/src/jdom/constants"
import { inIFrame } from "../../jacdac-ts/src/jdom/iframeclient"
import Packet from "../../jacdac-ts/src/jdom/packet"
import { randomDeviceId } from "../../jacdac-ts/src/jdom/random"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import useChange from "../jacdac/useChange"
import useClient from "./hooks/useClient"
import {
    decodePacketMessage,
    PacketMessage,
} from "./makecode/iframebridgeclient"

export interface HostedSimulatorDefinition {
    name: string
    url: string
}

interface HostedSimulator {
    id: string
    definition: HostedSimulatorDefinition
    devideId?: string
    unsub?: () => void
}

export interface HostedSimulatorsContextProps {
    hostedSimulators: HostedSimulatorManager
}

const HostedSimulatorsContext = createContext<HostedSimulatorsContextProps>({
    hostedSimulators: undefined,
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
        },
    ]
}

const CLASS_NAME = "jacdachostedsimulator"
const useStyles = makeStyles(() =>
    createStyles({
        hostedSimulators: {
            zIndex: -1000,
            "& iframe": {
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "1px",
                height: "1px",
                border: "none",
            },
        },
    })
)

const ID_PREFIX = "hostedsimulator"
export class HostedSimulatorManager extends JDClient {
    private _simulators: Record<string, HostedSimulator> = {}
    private _container: HTMLDivElement

    constructor(readonly bus: JDBus) {
        super()

        this.handleMessage = this.handleMessage.bind(this)
        // receiving packets
        window.addEventListener("message", this.handleMessage, false)
        this.mount(() =>
            window.removeEventListener("message", this.handleMessage)
        )
        // always clear on exist
        this.mount(() => this.clear())
    }

    get container() {
        return this._container
    }

    set container(value: HTMLDivElement) {
        this._container = value
        console.debug(`hostedsims: container ${this._container?.id}`)
        this.syncDOM()
    }

    get simulators(): HostedSimulator[] {
        return Object.values(this._simulators)
    }

    addSimulator(definition: HostedSimulatorDefinition) {
        // must be a device identifier since we're passing this down to the iframe
        const id = randomDeviceId()
        console.debug(`hostedsims: add ${id} -> ${definition.name}`)
        this._simulators[id] = { id, definition }
        this.syncDOM()
    }

    removeSimulator(deviceId: string) {
        const sim = this.resolveSimulator(deviceId)
        if (sim) {
            console.debug(`hostedsims: remove ${deviceId}`)
            sim.unsub?.()
            delete this._simulators[sim.id]
            this.syncDOM()
        }
    }

    private resolveSimulator(deviceId: string) {
        const sim = Object.values(this._simulators).find(
            sim => sim.devideId === deviceId
        )
        return sim
    }

    isSimulator(deviceId: string) {
        return !!this.resolveSimulator(deviceId)
    }

    clear() {
        Object.values(this.simulators).forEach(sim => sim.unsub?.())
        this._simulators = {}
        this.syncDOM()
    }

    private handleMessage(event: MessageEvent) {
        const { data } = event
        const msg = data as PacketMessage
        const { channel, type, sender } = msg
        let sim: HostedSimulator
        if (
            channel === "jacdac" &&
            type === "messagepacket" &&
            (sim = this._simulators[sender])
        ) {
            const pkts = decodePacketMessage(this.bus, msg)
            if (!pkts) return

            let changed = false
            for (const pkt of pkts) {
                // sniff the device id from annouce packets
                if (pkt.isAnnounce && sim.devideId !== pkt.deviceIdentifier) {
                    if (sim.devideId)
                        console.warn(
                            `hostedsim: device id changed from ${sim.devideId} to ${pkt.deviceIdentifier}`
                        )
                    sim.devideId = pkt.deviceIdentifier
                    changed = true
                }

                // send to native bus
                this.bus.sendPacketAsync(pkt)
                // send to javascript bus
                this.bus.processPacket(pkt)
            }
            if (changed) this.emit(CHANGE)
        }
    }

    private syncDOM() {
        // go through iframe and pop out the one that are not longer needed
        // iframe might have been relocated somewhere else in the tree
        const iframes = document.getElementsByClassName(CLASS_NAME)
        for (const iframe of iframes) {
            const id = iframe.id.slice(ID_PREFIX.length)
            if (this._simulators[id]) continue
            console.debug(`hostedsims: removing ${id}`)
            iframe.remove()
        }

        // go through simulator and ensure they are all started
        Object.values(this._simulators).forEach(sim => {
            const { id, definition } = sim
            const domid = ID_PREFIX + id

            if (document.getElementById(domid)) return

            console.debug(`hostedsims: starting iframe ${id} ${definition.url}`)
            const iframe = document.createElement("iframe")
            iframe.classList.add(CLASS_NAME)
            iframe.id = domid
            iframe.src = definition.url + "#" + id
            iframe.title = definition.name
            const origin = new URL(definition.url).origin
            this._container.append(iframe)

            // route packets
            const unsub = this.bus.subscribe(
                [PACKET_SEND, PACKET_PROCESS],
                (pkt: Packet) => {
                    if (pkt.sender === id) return

                    const msg: PacketMessage = {
                        type: "messagepacket",
                        channel: "jacdac",
                        broadcast: false,
                        data: pkt.toBuffer(),
                        sender: pkt.sender,
                    }
                    iframe.contentWindow?.postMessage(msg, origin)
                }
            )

            sim.unsub = unsub
        })
        this.emit(CHANGE)
    }
}

// eslint-disable-next-line react/prop-types
export const HostedSimulatorsProvider = ({ children }) => {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const containerRef = useRef<HTMLDivElement>()
    const containerId = useId()
    const hostedSimulators = useClient(() => new HostedSimulatorManager(bus))
    const classes = useStyles()

    // new container
    useEffect(() => {
        hostedSimulators.container = containerRef.current
        return () => (hostedSimulators.container = undefined)
    }, [])

    return (
        <HostedSimulatorsContext.Provider
            value={{
                hostedSimulators,
            }}
        >
            {children}
            <div
                id={containerId}
                className={classes.hostedSimulators}
                ref={containerRef}
            />
        </HostedSimulatorsContext.Provider>
    )
}
