import React, { createContext, useEffect, useMemo, useState } from "react"
import useSessionStorage from "../hooks/useSessionStorage"
import useEffectAsync from "../useEffectAsync"
import { BrainManager } from "./braindom"

const BRAIN_API_ROOT = "jacdac-cloud-0.azurewebsites.net/api"

export interface BrainManagerProps {
    token?: string
    setToken: (token: string) => void
    brainManager: BrainManager
    scriptId?: string
    setScriptId: (id: string) => void
    deviceId?: string
    setDeviceId: (id: string) => void
}

const defaultContextProps: BrainManagerProps = Object.freeze({
    setToken: () => {},
    setScriptId: () => {},
    setDeviceId: () => {},
    brainManager: undefined,
})
const BrainManagerContext =
    createContext<BrainManagerProps>(defaultContextProps)
BrainManagerContext.displayName = "brains"

export default BrainManagerContext

// eslint-disable-next-line react/prop-types
export const BrainManagerProvider = ({ children }) => {
    const [token, setToken] = useSessionStorage("brain-manager-token")
    const api = BRAIN_API_ROOT
    const brainManager = useMemo(
        () => (token ? new BrainManager(api, token) : undefined),
        [api, token]
    )
    const [scriptId, setScriptId] = useState("")
    const [deviceId, setDeviceId] = useState("")

    // reset selected devices/script when reloading manager
    useEffect(() => {
        setScriptId("")
        setDeviceId("")
    }, [brainManager])
    // first reload
    useEffectAsync(() => brainManager?.refresh(), [])

    return (
        <BrainManagerContext.Provider
            value={{
                token,
                setToken,
                brainManager,
                scriptId,
                setScriptId,
                deviceId,
                setDeviceId,
            }}
        >
            {children}
        </BrainManagerContext.Provider>
    )
}
