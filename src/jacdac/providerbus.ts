import JDBus from "../../jacdac-ts/src/jdom/bus"
import { withPrefix } from "gatsby"
import { isWebUSBSupported } from "../../jacdac-ts/src/jdom/transport/usb"
import { createUSBWorkerTransport } from "../../jacdac-ts/src/jdom/transport/workertransport"
import { createWebSocketTransport } from "../../jacdac-ts/src/jdom/transport/websockettransport"
import {
    createBluetoothTransport,
    isWebBluetoothSupported,
} from "../../jacdac-ts/src/jdom/transport/bluetooth"
import {
    createWebSerialTransport,
    isWebSerialSupported,
} from "../../jacdac-ts/src/jdom/transport/webserial"
import IFrameBridgeClient from "../components/makecode/iframebridgeclient"
import Flags from "../../jacdac-ts/src/jdom/flags"
import GamepadServerManager from "../../jacdac-ts/src/servers/gamepadservermanager"
import jacdacTsPackage from "../../jacdac-ts/package.json"
import { analytics, EventProperties } from "../components/hooks/useAnalytics"
import {
    CONNECTION_STATE,
    DEVICE_ANNOUNCE,
    DEVICE_CLEAN,
    DEVICE_PRODUCT_IDENTIFY,
    DEVICE_RESTART,
} from "../../jacdac-ts/src/jdom/constants"
import Transport, {
    ConnectionState,
} from "../../jacdac-ts/src/jdom/transport/transport"
import JDDevice from "../../jacdac-ts/src/jdom/device"
import {
    deviceSpecificationFromProductIdentifier,
    isInfrastructure,
} from "../../jacdac-ts/src/jdom/spec"
import { inIFrame } from "../../jacdac-ts/src/jdom/iframeclient"

function sniffQueryArguments() {
    if (typeof window === "undefined" || typeof URLSearchParams === "undefined")
        return {
            diagnostic: false,
            webUSB: isWebUSBSupported(),
            webBluetooth: isWebBluetoothSupported(),
        }

    const params = new URLSearchParams(window.location.search)
    const toolsMakecode =
        /\/tools\/makecode-/.test(window.location.href) ||
        params.get(`nestededitorsim`) === "1"
    return {
        diagnostics: params.get(`dbg`) === "1",
        webUSB:
            isWebUSBSupported() &&
            params.get(`webusb`) !== "0" &&
            !toolsMakecode,
        webBluetooth:
            isWebBluetoothSupported() &&
            params.get(`webble`) !== "0" &&
            !toolsMakecode,
        webSerial:
            isWebSerialSupported() &&
            params.get(`webserial`) !== "0" &&
            !toolsMakecode,
        webSocket:
            params.get(`ws`) === "1"
                ? "ws://127.0.0.1:8080/"
                : params.get("ws"),
        peers: params.get(`peers`) === "1",
        parentOrigin: params.get("parentOrigin"),
        frameId: window.location.hash?.slice(1),
        widget: params.get("widget") === "1",
        trace: params.get("trace") === "1",
        localhost: params.get("localhost") === "1",
        passive: params.get("passive") === "1",
    }
}

const args = sniffQueryArguments()
Flags.diagnostics = args.diagnostics
Flags.webUSB = args.webUSB
Flags.webBluetooth = args.webBluetooth
Flags.webSerial = args.webSerial
Flags.trace = args.trace

export class UIFlags {
    static widget = args.widget
    static peers = args.peers
    static localhost = args.localhost
    static passive = args.passive
}

// defeat react fast-refresh
function createBus(): JDBus {
    const worker =
        typeof window !== "undefined" &&
        new Worker(withPrefix(`/jacdac-worker-${jacdacTsPackage.version}.js`))
    const b = new JDBus(
        [
            Flags.webUSB && worker && createUSBWorkerTransport(worker),
            Flags.webSerial && createWebSerialTransport(),
            Flags.webBluetooth && createBluetoothTransport(),
            args.webSocket && createWebSocketTransport(args.webSocket),
        ],
        {
            parentOrigin: args.parentOrigin,
        }
    )
    b.passive = args.passive
    // parentOrigin: args.parentOrigin,
    //if (Flags.webUSB) b.setBackgroundFirmwareScans(true)
    GamepadServerManager.start(b)

    // tslint:disable-next-line: no-unused-expression
    // always start bridge
    if (typeof window !== "undefined") {
        if (inIFrame())
            new IFrameBridgeClient(b, args.frameId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(<any>window).__jacdacBus = b
    }

    const { trackEvent } = analytics
    if (trackEvent) {
        const createPayload = (d: JDDevice): EventProperties => {
            const productId = d.isPhysical ? d.productIdentifier : undefined
            const product =
                deviceSpecificationFromProductIdentifier(productId)?.id
            const services: Record<string, number> = {}
            for (const srv of d
                .services()
                .filter(srv => !isInfrastructure(srv.specification))) {
                const { name } = srv
                services[name] = (services[name] || 0) + 1
            }
            return {
                deviceId: d.anonymizedDeviceId,
                source: d.source?.split("-", 1)[0]?.toLowerCase(),
                physical: d.isPhysical,
                productId: productId?.toString(16),
                product,
                services: JSON.stringify(services),
                serviceClasses: JSON.stringify(d.serviceClasses.slice(1)),
            }
        }

        let cleanCount = 0
        // track connections
        b.on(
            CONNECTION_STATE,
            (transport: Transport) =>
                transport.connectionState === ConnectionState.Connected ||
                (transport.connectionState === ConnectionState.Disconnected &&
                    trackEvent(`jd.transport.${transport.connectionState}`, {
                        type: transport.type,
                        connectionState: transport.connectionState,
                    }))
        )
        // track services
        b.on(DEVICE_ANNOUNCE, (d: JDDevice) => {
            trackEvent("jd.announce", createPayload(d))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            trackEvent(`jd.stats`, b.stats.current as any)
        })
        // general stats
        b.on(DEVICE_CLEAN, () => {
            // log roughly every minute
            if (!(cleanCount++ % 30))
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                trackEvent(`jd.stats`, b.stats.current as any)
        })
        // product info
        b.on(DEVICE_PRODUCT_IDENTIFY, (d: JDDevice) => {
            if (d.isPhysical) trackEvent("jd.product", createPayload(d))
        })
        // track restarts
        b.on(DEVICE_RESTART, async (d: JDDevice) => {
            if (d.isPhysical) {
                await d.resolveProductIdentifier()
                trackEvent(`jd.restart`, createPayload(d))
            }
        })
    }

    return b
}

function cachedBus(): JDBus {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof Window !== "undefined" && (<any>window).__jacdacBus
}

const bus = cachedBus() || createBus()
export default bus
