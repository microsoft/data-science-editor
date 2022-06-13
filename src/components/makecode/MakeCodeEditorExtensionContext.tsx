import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react"
import { camelize } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import { JDClient } from "../../../jacdac-ts/src/jdom/client"
import { CHANGE, CONNECT } from "../../../jacdac-ts/src/jdom/constants"
import { inIFrame } from "../../../jacdac-ts/src/jdom/iframeclient"
import { JSONTryParse } from "../../../jacdac-ts/src/jdom/utils"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"
import { useDeviceSpecificationFromIdentifier } from "../../jacdac/useDeviceSpecification"
import useClient from "../hooks/useClient"
import useEffectAsync from "../useEffectAsync"
import { resolveMakecodeServiceFromClassIdentifier } from "./services"

export const READ = "read"
export const MESSAGE_PACKET = "messagepacket"
const HIDDEN = "hidden"
const SHOWN = "shown"

export interface ReadResponse {
    code?: string
    json?: string
    jres?: string
}

export class MakeCodeEditorExtensionClient extends JDClient {
    private readonly pendingCommands: {
        [key: string]: {
            action: string
            resolve: (resp: any) => void
            reject: (e: any) => void
        }
    } = {}
    private readonly extensionId: string = inIFrame()
        ? window.location.hash.substr(1)
        : undefined
    private _target: { id: string } = { id: "microbit" } // full apptarget
    private _connected = false
    private _visible = false

    constructor() {
        super()
        this.handleMessage = this.handleMessage.bind(this)
        if (typeof self !== "undefined") {
            self.addEventListener("message", this.handleMessage, false)
            this.mount(() =>
                self.removeEventListener("message", this.handleMessage)
            )
        }
        // always refresh on load
        this.on(SHOWN, () => this.refresh())
        // notify parent that we're ready
        this.init()
    }

    get target() {
        return this._target
    }

    get connected() {
        return this._connected
    }

    get visible() {
        return this._visible
    }

    private setVisible(vis: boolean) {
        if (this._visible !== vis) {
            this._visible = vis
            this.emit(CHANGE)
        }
    }

    private nextRequestId = 1
    private mkRequest(
        resolve: (resp: any) => void,
        reject: (e: any) => void,
        action: string,
        body?: any
    ): any {
        const id = "jd_" + this.nextRequestId++
        this.pendingCommands[id] = { action, resolve, reject }
        return {
            type: "pxtpkgext",
            action,
            extId: this.extensionId,
            response: true,
            id,
            body,
        }
    }

    private sendRequest<T>(action: string, body?: any): Promise<T> {
        this.log(`send ${action}`)
        if (!this.extensionId) return Promise.resolve(undefined)

        return new Promise((resolve, reject) => {
            const msg = this.mkRequest(resolve, reject, action, body)
            window.parent.postMessage(msg, "*")
        })
    }

    private handleMessage(ev: any) {
        const msg = ev.data
        if (msg?.type !== "pxtpkgext") return
        if (!msg.id) {
            switch (msg.event) {
                case "extinit":
                    this.log("init")
                    this._target = msg.target
                    this._connected = true
                    this.emit(CONNECT)
                    this.emit(CHANGE)
                    break
                case "extloaded":
                    this.log(`loaded`)
                    break
                case "extshown":
                    this.setVisible(true)
                    this.emit(SHOWN)
                    this.emit(CHANGE)
                    break
                case "exthidden":
                    this.setVisible(false)
                    this.emit(HIDDEN)
                    this.emit(CHANGE)
                    break
                case "extdatastream":
                    this.emit("datastream", true)
                    break
                case "extconsole":
                    this.emit("console", msg.body)
                    break
                case "extmessagepacket":
                    this.emit(MESSAGE_PACKET, msg.body)
                    break
                default:
                    console.debug("Unhandled event", msg)
            }
        } else {
            const { action, resolve, reject } =
                this.pendingCommands[msg.id] || {}
            delete this.pendingCommands[msg.id]

            if (msg.success && resolve) resolve(msg.resp)
            else if (!msg.success && reject) reject(msg.resp)
            // raise event as well
            switch (action) {
                case "extinit":
                    this._target = msg.target
                    this._connected = true
                    this.emit(CONNECT)
                    this.emit(CHANGE)
                    break
                case "extusercode":
                    // Loaded, set the target
                    this.emit("readuser", msg.resp)
                    this.emit(CHANGE)
                    break
                case "extreadcode":
                    // Loaded, set the target
                    this.emit(READ, msg.resp)
                    this.emit(CHANGE)
                    break
                case "extwritecode":
                    this.emit("written", undefined)
                    break
            }
        }
    }

    private async init() {
        this.log(`initializing`)
        await this.sendRequest<void>("extinit")
        this.log(`connected`)
        await this.refresh()
    }

    private async refresh() {
        this.log(`refresh`)
        await this.read()
    }

    async read(): Promise<ReadResponse> {
        if (!this.extensionId) {
            const r: ReadResponse = {}
            this.emit(READ, r)
            return r
        } else {
            const resp: ReadResponse = await this.sendRequest("extreadcode")
            return resp
        }
    }

    async readUser() {
        await this.sendRequest("extusercode")
    }

    async write(
        code: string,
        json?: string,
        jres?: string,
        dependencies?: Record<string, string>
    ): Promise<void> {
        if (!this.extensionId) {
            // Write to local storage instead
            this.emit("written", undefined)
        } else {
            await this.sendRequest<void>("extwritecode", {
                code: code || undefined,
                json: json || undefined,
                jres: jres || undefined,
                dependencies,
            })
        }
    }

    async queryPermission() {
        await this.sendRequest("extquerypermission")
    }

    async requestPermission(console: boolean) {
        await this.sendRequest("extrequestpermission", {
            console,
        })
    }

    async dataStreamConsole(console: boolean) {
        await this.sendRequest("extdatastream", {
            console,
        })
    }

    async dataStreamMessages(messages: boolean) {
        await this.sendRequest("extdatastream", {
            messages,
        })
    }
}

export interface ClientRole {
    name: string
    service: number
}

export interface Configuration {
    roles: ClientRole[]
    device?: string
}

export interface MakeCodeEditorExtensionContextProps {
    target: { id: string }
    connected: boolean
    configuration: Configuration
    setConfiguration: (config: Configuration) => void
    device?: jdspec.DeviceSpec
}

export const MakeCodeEditorExtensionContext =
    createContext<MakeCodeEditorExtensionContextProps>({
        target: { id: "microbit" },
        connected: false,
        configuration: undefined,
        setConfiguration: () => {},
        device: undefined,
    })
MakeCodeEditorExtensionContext.displayName = "makecode"

function toTypescript(config: Configuration) {
    const ns = "myModules"
    return `// auto-generated, do not edit.
namespace ${ns} {
${config.roles
    .map(
        role => `
    //% fixedInstance whenUsed block="${role.name}"
    export const ${camelize(role.name)} = new ${
            resolveMakecodeServiceFromClassIdentifier(role.service).client.qName
        }("${camelize(role.name)}");
`
    )
    .join("")}

    // start after main
    control.runInParallel(function() {
        ${config.roles
            .map(
                role => `    ${ns}.${camelize(role.name)}.start();
        `
            )
            .join("")}
    })
}
    `
}

function toDependencies(
    target: string,
    config: Configuration,
    device: jdspec.DeviceSpec
) {
    const r: Record<string, string> = {}
    config?.roles.forEach(role => {
        const mk = resolveMakecodeServiceFromClassIdentifier(role.service)
        r[mk.client.name] = `github:${mk.client.repo}`
    })
    console.log({ target, config, device })
    device?.makeCodeRepo
        ?.filter(r => r.target === target)
        .forEach(repo => {
            r[repo.name] = `github:${repo.slug}`
        })
    return r
}

function toJSON(config: Configuration) {
    return config && JSON.stringify(config, null, 4)
}

export function MakeCodeEditorExtensionProvider(props: {
    children: ReactNode
}) {
    const { children } = props
    const bus = useBus()
    useEffectAsync(() => bus.stop(), [])
    const client = useClient(() => new MakeCodeEditorExtensionClient(), [])
    const target = useChange(client, _ => _?.target)
    const connected = useChange(client, c => c?.connected)
    const [configuration, setConfiguration] = useState<Configuration>({
        roles: [],
    } as Configuration)
    const device = useDeviceSpecificationFromIdentifier(configuration.device)
    useEffect(
        () =>
            client?.subscribe(READ, (resp: ReadResponse) => {
                console.log(`mkcd: read received`)
                const cfg = JSONTryParse<Configuration>(resp.json)
                console.log({ resp, cfg })
                if (cfg) setConfiguration(cfg)
            }),
        [client]
    )

    useEffectAsync(async () => {
        const ts = toTypescript(configuration)
        const json = toJSON(configuration)
        const deps = toDependencies(target?.id, configuration, device)
        console.log(`mkcd: saving...`, { configuration, ts, json, deps })
        await client.write(ts, json, undefined, deps)
    }, [client, target, configuration, device])

    return (
        <MakeCodeEditorExtensionContext.Provider
            value={{
                target,
                connected,
                configuration,
                setConfiguration,
                device,
            }}
        >
            {children}
        </MakeCodeEditorExtensionContext.Provider>
    )
}

export default function useMakeCodeEditorExtension() {
    const props = useContext<MakeCodeEditorExtensionContextProps>(
        MakeCodeEditorExtensionContext
    )
    return props
}
