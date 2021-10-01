import { createStyles, makeStyles } from "@material-ui/core"
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from "react"
import { useId } from "react-use-id-hook"
import JDBus from "../../jacdac-ts/src/jdom/bus"
import {
    CHANGE,
    PACKET_PROCESS,
    PACKET_SEND,
} from "../../jacdac-ts/src/jdom/constants"
import JDEventSource from "../../jacdac-ts/src/jdom/eventsource"
import Packet from "../../jacdac-ts/src/jdom/packet"
import { randomDeviceId } from "../../jacdac-ts/src/jdom/random"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import useChange from "../jacdac/useChange"
import { PacketMessage } from "./makecode/iframebridgeclient"

export interface HostedSimulatorDefinition {
    name: string
    url: string
}

interface HostedSimulator {
    id: string
    definition: HostedSimulatorDefinition
    unsub?: () => void
}

export interface HostedSimulatorsContextProps {
    simulators: HostedSimulator[]
    addHostedSimulator: (definition: HostedSimulatorDefinition) => void
    removeHostedSimulator: (id: string) => void
    clearHostedSimulators: () => void
}

const HostedSimulatorsContext = createContext<HostedSimulatorsContextProps>({
    simulators: [],
    addHostedSimulator: () => {},
    removeHostedSimulator: () => {},
    clearHostedSimulators: () => {},
})

HostedSimulatorsContext.displayName = "hostedSims"

export default HostedSimulatorsContext

export function hostedSimulatorDefinitions(): HostedSimulatorDefinition[] {
    return [
        {
            name: "Azure IoT Uploader",
            url: "https://microsoft.github.io/pxt-jacdac/",
        },
    ]
}

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

class HostedSimulatorManager extends JDEventSource {
    private _simulators: Record<string, HostedSimulator> = {}
    private _container: HTMLDivElement

    constructor(readonly bus: JDBus) {
        super()
    }

    get container() {
        return this._container
    }

    set container(value: HTMLDivElement) {
        this._container = value
        console.debug(`hosted sim: container ${this._container?.id}`)
        this.syncDOM()
    }

    get simulators(): HostedSimulator[] {
        return Object.values(this._simulators)
    }

    addSimulator(definition: HostedSimulatorDefinition) {
        const id = randomDeviceId()
        this._simulators[id] = { id, definition }
        this.syncDOM()
    }

    removeSimulator(id: string) {
        const sim = this._simulators[id]
        if (sim) {
            sim.unsub?.()
            delete this._simulators[id]
            this.syncDOM()
        }
    }

    clear() {
        Object.values(this.simulators).forEach(sim => sim.unsub?.())
        this._simulators = {}
        this.syncDOM()
    }

    private syncDOM() {
        if (this._container) {
            // go through iframe and pop out the one that are not longer needed
            const iframes = this._container.getElementsByTagName("iframe")
            const iframeids: Record<string, boolean> = {}
            for (const iframe of iframes) {
                iframeids[iframe.id] = true
                if (this._simulators[iframe.id]) continue

                console.debug(`hosted sim: removing iframe ${iframe.id}`)
                iframe.remove()
            }

            // go through simulator and ensure they are all started
            Object.values(this._simulators).forEach(sim => {
                const { id, definition } = sim
                if (iframeids[id]) return

                console.debug(
                    `hosted sim: starting iframe ${id} ${definition.url}`
                )
                const iframe = document.createElement("iframe")
                iframe.id = id
                iframe.src = definition.url + "#" + id
                iframe.title = definition.name
                const origin = new URL(definition.url).origin
                this._container.append(iframe)

                // route packets
                const unsub = this.bus.subscribe(
                    [PACKET_SEND, PACKET_PROCESS],
                    (pkt: Packet) => {
                        /*                        console.debug(`hosted sim: sending ${pkt} to ${id}`, {
                            iframe,
                            domain,
                            sender: pkt.sender,
                        })*/
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
        }
        this.emit(CHANGE)
    }
}

// eslint-disable-next-line react/prop-types
export const HostedSimulatorsProvider = ({ children }) => {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const containerRef = useRef<HTMLDivElement>()
    const containerId = useId()
    const manager = useMemo(() => new HostedSimulatorManager(bus), [])
    const classes = useStyles()

    const simulators = useChange(manager, _ => _.simulators)
    const addHostedSimulator = (definition: HostedSimulatorDefinition) =>
        manager.addSimulator(definition)
    const removeHostedSimulator = (id: string) => manager.removeSimulator(id)
    const clearHostedSimulators = () => manager.clear()

    // new container
    useEffect(() => {
        manager.container = containerRef.current
        return () => (manager.container = undefined)
    }, [])

    // final cleanup
    useEffect(() => () => manager.clear(), [])

    return (
        <HostedSimulatorsContext.Provider
            value={{
                simulators,
                addHostedSimulator,
                removeHostedSimulator,
                clearHostedSimulators,
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
