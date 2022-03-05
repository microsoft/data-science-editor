import {
    Accordion,
    AccordionSummary,
    Stack,
    AccordionDetails,
    Chip,
    Typography,
    Grid,
    TextField,
} from "@mui/material"
import React, {
    ChangeEvent,
    useMemo,
    useState,
} from "react"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import HighlightTextField from "../../components/ui/HighlightTextField"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Markdown from "../../components/ui/Markdown"
import ChipList from "../../components/ui/ChipList"
import useDeviceImage from "../../components/devices/useDeviceImage"
import { useDeviceSpecificationFromProductIdentifier } from "../../jacdac/useDeviceSpecification"
import ImageAvatar from "../../components/tools/ImageAvatar"
import {
    PanelTest,
    PanelTestSpec,
    tryParsePanelTestSpec,
    DeviceTestSpec,
} from "../../../jacdac-ts/src/jdom/testdom"
import CopyButton from "../../components/ui/CopyButton"
import { delay } from "../../../jacdac-ts/src/jdom/utils"
import { useId } from "react-use-id-hook"
import { Button } from "gatsby-theme-material-ui"
import useSnackbar from "../../components/hooks/useSnackbar"
import usePanelTest from "../../components/testdom/usePanelTest"
import TestIcon from "../../components/icons/TestIcon"
import PanelTestTreeView from "../../components/testdom/PanelTestTreeView"

const PANEL_MANIFEST_KEY = "panel-test-manifest"
const PANEL_UPLOAD_URL = "panel-test-post-url"

function PanelDeviceChip(props: { device: DeviceTestSpec }) {
    const { device } = props
    const { productIdentifier, count } = device
    const specification =
        useDeviceSpecificationFromProductIdentifier(productIdentifier)
    const imageUrl = useDeviceImage(specification, "avatar")
    const name = specification?.name || "?"

    return (
        <Chip
            icon={<ImageAvatar src={imageUrl} alt={name} avatar={true} />}
            label={`${name} x ${count}`}
            size="small"
        />
    )
}

function Manifest(props: {
    source?: string
    setSource: (v: string) => void
    panel: PanelTestSpec
}) {
    const { source, setSource, panel } = props
    const [expanded, setExpanded] = useState(!source)
    const handleExpanded = () => setExpanded(v => !v)

    return (
        <Accordion expanded={expanded} onChange={handleExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {panel ? (
                    <ChipList>
                        {panel?.devices.map(device => (
                            <PanelDeviceChip
                                key={device.productIdentifier}
                                device={device}
                            />
                        ))}
                    </ChipList>
                ) : (
                    <Typography variant="body1">
                        Invalid configuration
                    </Typography>
                )}
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <Stack spacing={1}>
                    <h2>Configuration</h2>
                    <HighlightTextField
                        code={source}
                        language={"json"}
                        onChange={setSource}
                    />
                    <Markdown
                        source={`
#### Manifest Format                        

A JSON formatted manifest containing an array of device specification reference and their expected item count:
\`\`\`typescript
export interface PanelTestSpec {
    id: string
    devices: {
        // decimal or hex as string
        productIdentifier: number | string
        count: number
        firmwareVersion?: string
        // optional if device in catalog
        services?: {
            name?: string
            // decimal or hex as string
            serviceClass?: number | string
            count?: number
        }[]
    }[]
    oracles?: {
        serviceClass: number | string
        deviceId: string
        tolerance?: number
    }[]
}
\`\`\`

For example, a panel with 20 modules with a humidity and temperature services, using an additional device \`38ce43597a4f9e69\`
as oracle would be defined as
\`\`\`json
{
    "id": "example",
    "devices": [{
        "productIdentifier": "0x3156cfd7",
        "count": 20,
        "services": [{
            "name": "humidity"
        }, {
            "name": "temperature"
        }]
    }],
    "oracles": [{
        "serviceClass": "humidity",
        "deviceId": "38ce43597a4f9e69",
        "tolerance": 1
    }, {
        "serviceClass": "temperature",
        "deviceId": "38ce43597a4f9e69",
        "tolerance": 1
    }]
}
\`\`\`
`}
                    />
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}

function Results(props: { panel: PanelTest }) {
    const { panel } = props
    const [expanded, setExpanded] = useState(false)
    const handleExpanded = () => setExpanded(v => !v)

    return (
        <Accordion expanded={expanded} onChange={handleExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h2>
                    Test Result: <TestIcon node={panel} />
                </h2>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <PanelTestTreeView panel={panel} showTwins={true} />
            </AccordionDetails>
        </Accordion>
    )
}

function Exports(props: { panel: PanelTest }) {
    const { panel } = props
    const urlId = useId()
    const tokenId = useId()
    const [url, setUrl] = useLocalStorage(PANEL_UPLOAD_URL, "")
    const [token, setToken] = useState("")
    const [posting, setPosting] = useState(false)
    const { setError, enqueueSnackbar } = useSnackbar()
    const urlError = !!url && !/https?:\/\//i.test(url)

    const serialize = async () => {
        const repo = process.env.GATSBY_GITHUB_REPOSITORY
        const sha = process.env.GATSBY_GITHUB_SHA
        panel.deviceTests
            .map(d => d.device)
            .filter(d => !!d)
            .forEach(d => d.refreshFirmwareInfo())
        await delay(500)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r: any = panel.export()
        if (repo && sha) r.jacdac = { repo, sha }
        return JSON.stringify(r, null, 2)
    }

    const handleUrlChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setUrl(ev.target.value?.trim() || "")
    }
    const handleTokenChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setToken(ev.target.value)
    }

    const handlePost = async () => {
        try {
            setPosting(true)
            const body = await serialize()
            const req: any = {
                headers: {
                    "content-type": "application/json",
                },
                method: "post",
                url,
                body,
            }
            if (token) req.headers.authorization = token
            const res = await fetch(req)
            if (res.status === 200) enqueueSnackbar(`results posted`)
            else setError(`error while posting results (status ${res.status})`)
        } catch (e) {
            setError(e)
        } finally {
            setPosting(false)
        }
    }

    return (
        <>
            <h3>Export</h3>
            <Grid container spacing={1}>
                <Grid item>
                    <TextField
                        id={urlId}
                        label={"Upload url"}
                        value={url}
                        size="small"
                        onChange={handleUrlChange}
                        helperText={
                            urlError ||
                            "Url to an POST web api that receives the results as a JSON payload"
                        }
                        error={!!urlError}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        id={tokenId}
                        label={"Authorization header"}
                        value={token}
                        size="small"
                        onChange={handleTokenChange}
                        helperText={
                            "Optional Authorization header content (i.e. token)"
                        }
                    />
                </Grid>
                <Grid item>
                    <Button
                        aria-label="Post test results to a user provided API url"
                        disabled={!url || !!urlError || posting}
                        variant="outlined"
                        onClick={handlePost}
                    >
                        Post
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <CopyButton
                        variant="outlined"
                        onCopy={serialize}
                        label="export to clipboard"
                    />
                </Grid>
            </Grid>
        </>
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
            <h1>Panel Tester</h1>
            <Manifest
                source={manifestSource}
                setSource={setManifestSource}
                panel={panelSpec}
            />
            {panel && <Results panel={panel} />}
            {panel && <Exports panel={panel} />}
        </Stack>
    )
}
