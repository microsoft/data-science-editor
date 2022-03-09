import { useEffect, useState } from "react"
import { PanelTestSpec } from "../../../jacdac-ts/src/testdom/spec"
import { PanelTest } from "../../../jacdac-ts/src/testdom/nodes"
import { createPanelTest } from "../../../jacdac-ts/src/testdom/compiler"
import useBus from "../../jacdac/useBus"

export default function usePanelTest(panelSpec: PanelTestSpec) {
    const bus = useBus()
    const [panel, setPanel] = useState<PanelTest>(undefined)
    useEffect(() => {
        if (panelSpec) {
            try {
                const p = createPanelTest(bus, panelSpec)
                if (p)
                    p.bus = bus
                setPanel(p)
                return () => (p.bus = undefined)
            } catch (e) {
                console.debug(e)
            }
        }
        setPanel(undefined)
        return undefined
    }, [panelSpec])
    return panel
}
