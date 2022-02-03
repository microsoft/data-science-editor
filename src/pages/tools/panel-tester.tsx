import {
    Accordion,
    AccordionSummary,
    Stack,
    AccordionDetails,
    Chip,
} from "@mui/material"
import React, { useMemo, useState } from "react"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import HighlightTextField from "../../components/ui/HighlightTextField"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Markdown from "../../components/ui/Markdown"
import { JSONTryParse } from "../../../jacdac-ts/src/jdom/utils"
import ChipList from "../../components/ui/ChipList"
import useDeviceImage from "../../components/devices/useDeviceImage"
import { useDeviceSpecificationFromIdentifier } from "../../jacdac/useDeviceSpecification"
import ImageAvatar from "../../components/tools/ImageAvatar"

const PANEL_MANIFEST_KEY = "panel-test-manifest"

interface PanelDeviceSpec {
    id: string
    count: number
}

interface PanelSpec {
    id?: string
    devices: PanelDeviceSpec[]
}

function tryParseManifest(source: string) {
    const json = JSONTryParse(source) as PanelSpec
    if (
        json?.id &&
        json.devices &&
        Array.isArray(json.devices) &&
        json.devices.every(d => !!d.id && d.count > 0)
    )
        return json

    return undefined
}

function PanelDeviceChip(props: { device: PanelDeviceSpec }) {
    const { device } = props
    const { id, count } = device
    const specification = useDeviceSpecificationFromIdentifier(id)
    const imageUrl = useDeviceImage(specification, "avatar")
    const name = specification?.name || "?"

    return (
        <Chip
            icon={<ImageAvatar src={imageUrl} alt={id} avatar={true} />}
            label={`${name} x ${count}`}
            size="small"
        />
    )
}

function Manifest(props: {
    source?: string
    setSource: (v: string) => void
    panel: PanelSpec
}) {
    const { source, setSource, panel } = props
    const [expanded, setExpanded] = useState(!source)
    const handleExpanded = () => setExpanded(v => !v)

    return (
        <Accordion expanded={expanded} onChange={handleExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {panel && (
                    <ChipList>
                        {panel?.devices.map(device => (
                            <PanelDeviceChip key={device.id} device={device} />
                        ))}
                    </ChipList>
                )}
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <Stack spacing={1}>
                    <HighlightTextField
                        code={source}
                        language={"json"}
                        onChange={setSource}
                    />
                    <Markdown
                        source={`
#### Manifest Format                        

A JSON formatted manifest containing an array of device specification reference and their expected item count:
\`\`\`js
{
    // (optional) panel identifier
    id?: string
    devices: {
        // device identifier in Jacdac catalog
        id: string,
        // expected number of devices in the panel
        count: number
    }[]
}
\`\`\`
`}
                    />
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}

export default function PanelTester() {
    const [manifestSource, setManifestSource] = useLocalStorage(
        PANEL_MANIFEST_KEY,
        ""
    )
    const panel = useMemo(
        () => tryParseManifest(manifestSource),
        [manifestSource]
    )

    return (
        <Stack spacing={1}>
            <h1>Panel Tester</h1>
            <Manifest
                source={manifestSource}
                setSource={setManifestSource}
                panel={panel}
            />
        </Stack>
    )
}
