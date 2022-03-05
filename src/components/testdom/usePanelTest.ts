import { useEffect, useState } from "react";
import { createPanelTest, PanelTest, PanelTestSpec } from "../../../jacdac-ts/src/jdom/testdom";
import useBus from "../../jacdac/useBus";

export default function usePanelTest(panelSpec: PanelTestSpec) {
    const bus = useBus()
    const [panel, setPanel] = useState<PanelTest>(undefined)
    useEffect(() => {
        if (panelSpec) {
            try {
                const p = createPanelTest(bus, panelSpec)
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