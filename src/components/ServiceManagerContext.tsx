import React, { createContext, useContext, useEffect, useRef } from "react";
import { JSONTryParse, SMap } from "../../jacdac-ts/src/jdom/utils";
import { BrowserFileStorage, HostedFileStorage, IFileStorage } from '../../jacdac-ts/src/embed/filestorage'
import { IThemeMessage } from "../../jacdac-ts/src/embed/protocol";
import { ModelStore, HostedModelStore } from "../../jacdac-ts/src/embed/modelstore";
import { IFrameTransport } from "../../jacdac-ts/src/embed/transport";
import DarkModeContext from "./ui/DarkModeContext";
import JacdacContext, { JacdacContextProps } from "../jacdac/Context";
import { JDDevice } from "../../jacdac-ts/src/jdom/device";
import { IDeviceNameSettings, JDBus } from "../../jacdac-ts/src/jdom/bus"
import { inIFrame } from "../../jacdac-ts/src/jdom/iframeclient";

export interface ISettings {
    get(key: string): string;
    set(key: string, value: string): void;
    clear(): void;
}

export class LocalStorageSettings implements ISettings {
    private live: SMap<string>
    constructor(private readonly key: string) {
        this.live = JSONTryParse(typeof window !== "undefined"
            && window.localStorage.getItem(key)) || {}
    }
    get(key: string): string {
        return this.live[key]
    }
    set(key: string, value: string): void {
        if (value === undefined || value === null)
            delete this.live[key]
        else
            this.live[key] = value;
        if (typeof window !== "undefined")
            window.localStorage.setItem(this.key, JSON.stringify(this.live, null, 2))
    }
    clear() {
        this.live = {}
        if (typeof window !== "undefined")
            window.localStorage.removeItem(this.key)
    }
}

class LocalStorageDeviceNameSettings implements IDeviceNameSettings {
    constructor(readonly bus: JDBus, private readonly settings: ISettings) { }
    resolve(device: JDDevice): string {
        return this.settings.get(device.deviceId)
    }
    notifyUpdate(device: JDDevice, name: string): void {
        if (this.bus.deviceHost(device.deviceId) === undefined)
            this.settings.set(device.deviceId, name)
    }
}

export interface ServiceManagerContextProps {
    isHosted: boolean;
    fileStorage: IFileStorage;
    modelStore: ModelStore;
}

const ServiceManagerContext = createContext<ServiceManagerContextProps>({
    isHosted: false,
    fileStorage: null,
    modelStore: null
});
ServiceManagerContext.displayName = "Services";

export default ServiceManagerContext;

// eslint-disable-next-line react/prop-types
export const ServiceManagerProvider = ({ children }) => {
    const { toggleDarkMode } = useContext(DarkModeContext)
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const propsRef = useRef<ServiceManagerContextProps>(createProps())

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (ev: MessageEvent<any>) => {
        const msg = ev.data;
        if (msg?.source !== 'jacdac')
            return;
        switch (msg.type) {
            case 'theme': {
                const themeMsg = msg as IThemeMessage
                toggleDarkMode(themeMsg.data.type);
                break;
            }
        }
    }

    // receiving messages
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.addEventListener('message', handleMessage, false)
            return () => window.removeEventListener('message', handleMessage);
        }
        return () => { };
    }, [])

    return <ServiceManagerContext.Provider value={propsRef.current}>
        {children}
    </ServiceManagerContext.Provider>

    function createProps(): ServiceManagerContextProps {
        const isHosted = inIFrame();
        let fileStorage: IFileStorage = new BrowserFileStorage()
        const deviceNames = new LocalStorageDeviceNameSettings(
            bus,
            new LocalStorageSettings("jacdac_device_names")
        );
        bus.host.deviceNameSettings = deviceNames;
        let modelStore: ModelStore = undefined;
        if (isHosted) {
            console.log(`starting hosted services`)
            const transport = new IFrameTransport(bus)
            fileStorage = new HostedFileStorage(transport)
            modelStore = new HostedModelStore(transport);

            // notify host that we are ready
            transport.postReady()
        }
        return {
            isHosted,
            fileStorage,
            modelStore
        }
    }
}
