import React, { createContext, useEffect, useMemo, useState } from "react"
import useLocalStorage from "../hooks/useLocalStorage"
import useEffectAsync from "../useEffectAsync"
import { BrainManager } from "./braindom"

export interface BrainManagerProps {
    domain?: string
    setDomain: (domain: string) => void
    token?: string
    setToken: (token: string) => void
    brainManager: BrainManager
    scriptId?: string
    setScriptId: (id: string) => void
    deviceId?: string
    setDeviceId: (id: string) => void
}

const defaultContextProps: BrainManagerProps = Object.freeze({
    setDomain: () => {},
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
    const [domain, _setDomain] = useLocalStorage(
        "brain-manager-domain",
        "jacdac-portal2.azurewebsites.net"
    )
    const [token, setToken] = useLocalStorage("brain-manager-token")
    const brainManager = useMemo(
        () => (token && domain ? new BrainManager(domain, token) : undefined),
        [domain, token]
    )
    const [scriptId, setScriptId] = useState("")
    const [deviceId, setDeviceId] = useState("")

    const setDomain = (domain: string) => {
        _setDomain(domain?.replace(/^https:\/\//i, "")?.replace(/\/$/, ""))
        setToken("")
    }

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
                domain,
                setDomain,
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
