import { useEffect } from "react"
import {
    DEVICE_CONNECT,
    DEVICE_DISCONNECT,
} from "../../jacdac-ts/src/jdom/constants"
import {
    addServiceProvider,
    serviceProviderDefinitions,
} from "../../jacdac-ts/src/servers/servers"
import useLocalStorage from "../components/hooks/useLocalStorage"
import useBus from "./useBus"

const STORAGE_KEY = "active_simulators"

interface Simulators {
    templates: string[]
}

export function usePersistentSimulators() {
    const [simulators, setSimulators] = useLocalStorage<Simulators>(
        STORAGE_KEY,
        undefined
    )
    const bus = useBus()
    const resolveTemplates = () =>
        bus
            .serviceProviders()
            .map(sp => sp.template)
            .filter(t => !!t)

    const snapshot = () => {
        const templates = resolveTemplates()
        setSimulators({ templates })
    }

    useEffect(() => {
        const serviceProviders = serviceProviderDefinitions()
        const templates = resolveTemplates()
        simulators?.templates?.forEach(template => {
            const i = templates.indexOf(template)
            if (i > -1) {
                templates.splice(i, 1)
            } else {
                const def = serviceProviders.find(sp => sp.name === template)
                if (def) addServiceProvider(bus, def)
            }
        })

        snapshot()
    }, [])

    useEffect(
        () => bus.subscribe([DEVICE_CONNECT, DEVICE_DISCONNECT], snapshot),
        [bus]
    )
}
