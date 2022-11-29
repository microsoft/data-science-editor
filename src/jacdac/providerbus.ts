import { JDBus } from "../../jacdac-ts/src/jdom/bus"
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
import { Flags } from "../../jacdac-ts/src/jdom/flags"
import { GamepadHostManager } from "../../jacdac-ts/src/servers/gamepadservermanager"
import jacdacTsPackage from "../../jacdac-ts/package.json"
import { analytics, EventProperties } from "../components/hooks/useAnalytics"
import {
    CONNECTION_STATE,
    DEVICE_ANNOUNCE,
    DEVICE_CLEAN,
    DEVICE_FIRMWARE_INFO,
    DEVICE_PACKET_ANNOUNCE,
    DEVICE_RESTART,
    LoggerPriority,
} from "../../jacdac-ts/src/jdom/constants"
import {
    Transport,
    ConnectionState,
} from "../../jacdac-ts/src/jdom/transport/transport"
import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import { isInfrastructure } from "../../jacdac-ts/src/jdom/spec"
import createAzureIotHubServiceDefinition from "../components/jacscript/azureiotconnector"
import { addServiceProviderDefinition } from "../../jacdac-ts/src/servers/servers"

function sniffQueryArguments() {
    if (typeof window === "undefined" || typeof URLSearchParams === "undefined")
        return {
            diagnostic: false,
            webUSB: isWebUSBSupported(),
            webBluetooth: isWebBluetoothSupported(),
        }

    const isMediaDevicesSupported = () => {
        return (
            typeof navigator !== undefined &&
            !!navigator.mediaDevices &&
            !!navigator.mediaDevices.enumerateDevices &&
            !!navigator.mediaDevices.getUserMedia
        )
    }
    const location = window.location
    const href = location.href
    const params = new URLSearchParams(location.search)
    const toolsMakecode =
        /\/tools\/makecode-/.test(href) || params.get(`nestededitorsim`) === "1"
    const toolsMakeEditorExtension = /\/tools\/makecode-editor-extension/.test(
        href
    )
    const isLocalhost = /localhost/.test(href)
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
        parentOrigin: params.get("parentOrigin"),
        frameId: location.hash?.slice(1),
        widget: params.get("widget") === "1",
        trace: params.get("trace") === "1",
        localhost: params.get("localhost") === "1",
        passive: params.get("passive") === "1" || toolsMakeEditorExtension,
        gamepad: params.get("gamepad") === "1",
        hosted: params.get("hosted") === "1" || params.get("embed") === "1",
        storage: params.get("storage") === "0" ? false : true,
        bus: params.get("bus") === "0" ? false : true,
        webcam: isMediaDevicesSupported(),
        consoleinsights: params.get("consoleinsights") === "1",
        devTools: params.get("devtools"),
        connect: params.get("connect") !== "0",
        transient: params.get("transient") === "1",
        persistent: params.get("persistent") === "1" || isLocalhost,
        footer: params.get("footer") !== "0",
        jacscriptvm:
            params.get("jacscriptvm") === "1" ||
            params.get("jacscript") === "1",
        resetIn: params.get("resetin") === "1",
        serialVendorIds: (params.get("serialvendorids") || "")
            .split(/,/g)
            .map(v => parseInt(v, 16))
            .filter(v => !isNaN(v)),
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
    static localhost = args.localhost
    static storage = args.storage
    static hosted = args.hosted
    static gamepad = args.gamepad
    static webcam = args.webcam
    static consoleinsights = args.consoleinsights
    static devTools = args.devTools
    static connect = args.connect
    static transient = args.transient
    static persistent = args.persistent
    static jacscriptvm = args.jacscriptvm
    static resetIn = args.resetIn
    static footer = args.footer
}

// defeat react fast-refresh
function createBus(): JDBus {
    const worker =
        typeof window !== "undefined" &&
        Flags.webUSB &&
        UIFlags.connect &&
        new Worker(withPrefix(`/jacdac-worker-${jacdacTsPackage.version}.js`))
    const b = new JDBus(
        [
            worker && createUSBWorkerTransport(worker),
            Flags.webSerial && UIFlags.connect && createWebSerialTransport(),
            Flags.webBluetooth && UIFlags.connect && createBluetoothTransport(),
            args.webSocket && createWebSocketTransport(args.webSocket),
        ],
        {
            serviceProviderIdSalt: args.frameId,
            parentOrigin: args.parentOrigin,
            client: false,
            dashboard: true,
            resetIn: args.resetIn,
            serialVendorIds: args.serialVendorIds,
        }
    )
    b.passive = args.passive
    b.minLoggerPriority = LoggerPriority.Log
    // parentOrigin: args.parentOrigin,
    //if (Flags.webUSB) b.setBackgroundFirmwareScans(true)
    if (UIFlags.gamepad) GamepadHostManager.start(b)

    // tslint:disable-next-line: no-unused-expression
    // always start bridge
    if (typeof window !== "undefined") {
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
                b.deviceCatalog.specificationFromProductIdentifier(
                    productId
                )?.id
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
                b.deviceCatalog.specificationFromProductIdentifier(
                    productId
                )?.id
            const uptime = d.uptime
            const { restarts, announce } = d.stats
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
        if (!args.bus) b.stop()

        addServiceProviderDefinition(createAzureIotHubServiceDefinition())
    }

    return b
}

function cachedBus(): JDBus {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof Window !== "undefined" && (<any>window).__jacdacBus
}

const bus = cachedBus() || createBus()
export default bus
