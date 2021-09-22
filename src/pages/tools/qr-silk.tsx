import {
    Grid,
    List,
    ListItem,
    ListItemText,
    Switch,
    TextField,
} from "@material-ui/core"
import React, { ChangeEvent, lazy, useState } from "react"
import { useId } from "react-use-id-hook"
import Suspense from "../../components/ui/Suspense"
import { toMap } from "../../../jacdac-ts/src/jdom/utils"
const SilkQRCode = lazy(() => import("../../components/widgets/SilkQrCode"))

import { graphql } from "gatsby"
import { Button } from "gatsby-theme-material-ui"

export const query = graphql`
    {
        allQrUrlDeviceMapCsv {
            nodes {
                vanityname
                revision
                modulename
                designid
            }
        }
    }
`

export default function DeviceQRCodeGenerator(props: {
    data: {
        allQrUrlDeviceMapCsv: {
            nodes: {
                vanityname: string
                modulename: string
                designid: string
                revision: string
            }[]
        }
    }
}) {
    const { data } = props
    const { nodes } = data.allQrUrlDeviceMapCsv
    const knowns = toMap(
        nodes,
        n => n.vanityname.toUpperCase(),
        n => n
    )
    const [vanity, setVanity] = useState(`AAAAAB`)
    const [mirror, setMirror] = useState(false)
    const [size, setSize] = useState(0.3)
    const handleUrlChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const vanity = ev.target.value?.toUpperCase()
        setVanity(vanity)
    }
    const handleSizeChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const s = Number(ev.target.value)
        if (!isNaN(s)) setSize(s)
    }
    const handleMirror = (ev: ChangeEvent<HTMLInputElement>) => {
        setMirror(!!ev.target.checked)
    }
    const mirrorid = useId()
    const switchid = useId()
    const url = !!vanity && `HTTP://AKA.MS/${vanity}`
    const known = knowns[vanity]
    const { modulename, designid, revision } = known || {}
    const handleVanity = (vanityname: string) => () =>
        setVanity(vanityname.toUpperCase())
    const handleNextVanity = () => {
        const next = Object.values(nodes).find(({ designid }) => !designid)
        if (next) setVanity(next.vanityname.toUpperCase())
    }
    return (
        <>
            <h1>Silk QR Code generator</h1>
            <p>
                Enter a short URL HTTP://AKA.MS/<strong>vanity name</strong> to
                be encoded as a silk compatible QR code. If you use a link, make
                sure to update{" "}
                <a href="https://github.com/microsoft/jacdac/blob/main/devices/microsoft/research/qr-url-device-map.csv">
                    GitHub
                </a>
                .
            </p>
            <Grid container spacing={1}>
                <Grid item xs>
                    <TextField
                        fullWidth={true}
                        label="vanity name"
                        value={vanity}
                        placeholder="AAAAA"
                        onChange={handleUrlChange}
                        helperText={"HTTP://AKA.MS/..."}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label="block size (cm)"
                        type="number"
                        value={size}
                        onChange={handleSizeChange}
                    />
                </Grid>
                <Grid item>
                    <Switch checked={mirror} onChange={handleMirror} />
                    <label id={mirrorid} htmlFor={switchid}>
                        mirror
                    </label>
                </Grid>
                <Grid item xs>
                    <Button variant="contained" onClick={handleNextVanity}>
                        Pick Unassigned
                    </Button>
                </Grid>
            </Grid>
            <h2>URL</h2>
            <pre>
                <a href={url}>{url}</a>
            </pre>
            {known && (
                <>
                    <h2>Reserved device entry</h2>
                    <p>
                        {designid
                            ? `${designid}: ${modulename} v${revision}`
                            : `unassigned`}
                    </p>
                </>
            )}
            <h2>QR codes</h2>
            <Suspense>
                <SilkQRCode url={url} mirror={mirror} size={size} />
            </Suspense>
            <h2>Preview</h2>
            <p>
                If you see bing.com for aka.ms links, it&quot;s likely to be
                free.
            </p>
            <iframe
                title="Link preview"
                style={{ width: "100%", height: "14rem", border: "none" }}
                src={url?.replace(/^http:/i, "HTTPS:")}
                sandbox="allow-scripts"
            />
            <h2>Known devices</h2>
            <List>
                {nodes
                    .filter(({ designid }) => !!designid)
                    .map(({ vanityname, modulename, designid, revision }) => (
                        <ListItem
                            button
                            key={vanityname}
                            onClick={handleVanity(vanityname)}
                        >
                            <ListItemText
                                primary={`${designid}: ${modulename} v${revision}`}
                                secondary={`aka.ms/${vanityname}`}
                            />
                        </ListItem>
                    ))}
            </List>
        </>
    )
}
