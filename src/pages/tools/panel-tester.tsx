import {
    Accordion,
    AccordionSummary,
    Stack,
    AccordionDetails,
} from "@mui/material"
import React, { useMemo, useState } from "react"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { PanelTest } from "../../../jacdac-ts/src/testdom/nodes"
import { tryParsePanelTestSpec } from "../../../jacdac-ts/src/testdom/compiler"
import usePanelTest from "../../components/testdom/usePanelTest"
import TestStateIcon from "../../components/testdom/TestStateIcon"
import TestTreeView from "../../components/testdom/TestTreeView"
import DeviceTestExporter from "../../components/testdom/DeviceTestExporter"
import FirmwareLoader from "../../components/firmware/FirmwareLoader"
import PanelSpecEditor from "../../components/testdom/PanelSpecEditor"

const PANEL_MANIFEST_KEY = "panel-test-manifest"

function Results(props: { panel: PanelTest }) {
    const { panel } = props
    const [expanded, setExpanded] = useState(true)
    const handleExpanded = () => setExpanded(v => !v)

    return (
        <Accordion expanded={expanded} onChange={handleExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h2>
                    Test Result: <TestStateIcon node={panel} />
                </h2>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <TestTreeView
                    test={panel}
                    showTwins={true}
                    defaultExpanded={true}
                />
            </AccordionDetails>
        </Accordion>
    )
}

export default function PanelTester() {
    const [manifestSource, setManifestSource] = useLocalStorage(
        PANEL_MANIFEST_KEY,
        ""
    )
    const panelSpec = useMemo(
        () => tryParsePanelTestSpec(manifestSource),
        [manifestSource]
    )
    const panel = usePanelTest(panelSpec)

    return (
        <Stack spacing={3}>
            <FirmwareLoader />
            <h1>Panel Tester</h1>
            <PanelSpecEditor
                source={manifestSource}
                setSource={setManifestSource}
                panel={panelSpec}
            />
            {panel && <Results panel={panel} />}
            {panel && <DeviceTestExporter />}
        </Stack>
    )
}
