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
    DEVICE_FIRMWARE_INFO,
    DEVICE_PACKET_ANNOUNCE,
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
    const toolsMakeEditorExtension = /\/tools\/makecode-editor-extension/.test(
        window.location.href
    )
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
        passive: params.get("passive") === "1" || toolsMakeEditorExtension,
        gamepad: params.get("gamepad") === "1",
        hosted: params.get("hosted") === "1" || params.get("embed") === "1",
        storage: params.get("storage") === "0" ? false : true,
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
    static storage = args.storage
    static hosted = args.hosted
    static gamepad = args.gamepad
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
            client: false,
        }
    )
    b.passive = args.passive
    // parentOrigin: args.parentOrigin,
    //if (Flags.webUSB) b.setBackgroundFirmwareScans(true)
    if (UIFlags.gamepad) GamepadServerManager.start(b)

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
        const createServicePayload = (d: JDDevice): EventProperties => {
            const physical = d.isPhysical
            const productId = physical ? d.productIdentifier : undefined
            const firmware = physical ? d.firmwareVersion : undefined
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
                physical,
                productId: productId?.toString(16),
                product,
                firmware,
                services: JSON.stringify(services),
                serviceClasses: JSON.stringify(d.serviceClasses.slice(1)),
            }
        }
        const createDevicePayload = (d: JDDevice): EventProperties => {
            const physical = d.isPhysical
            const productId = physical ? d.productIdentifier : undefined
            const firmware = physical ? d.firmwareVersion : undefined
            const product =
                deviceSpecificationFromProductIdentifier(productId)?.id
            const uptime = d.uptime
            const { restarts, announce } = d.stats.current
            return {
                deviceId: d.anonymizedDeviceId,
                source: d.source?.split("-", 1)[0]?.toLowerCase(),
                physical,
                productId: productId?.toString(16),
                product,
                firmware,
                uptime,
                restarts,
                announce,
            }
        }

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
        // track services on announce
        b.on(DEVICE_ANNOUNCE, (d: JDDevice) => {
            trackEvent("jd.announce", createServicePayload(d))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            trackEvent(`jd.stats`, b.stats.current as any)
        })
        // track uptime
        b.on(DEVICE_PACKET_ANNOUNCE, (d: JDDevice) => {
            if (!(d.stats.announce % 20))
                trackEvent(`jd.uptime`, createDevicePayload(d))
        })
        // track product id
        b.on(DEVICE_FIRMWARE_INFO, (d: JDDevice) => {
            const info = d.firmwareInfo
            if (info && d.isPhysical)
                trackEvent("jd.product", createServicePayload(d))
        })
        // general stats
        b.on(DEVICE_CLEAN, () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            trackEvent(`jd.stats`, b.stats.current as any)
        })
        // track restarts
        b.on(DEVICE_RESTART, async (d: JDDevice) => {
            if (d.isPhysical) {
                await d.resolveProductIdentifier()
                trackEvent(`jd.restart`, createServicePayload(d))
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
