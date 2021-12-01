import { Alert, Grid, Switch, TextField } from "@mui/material"
import React, { ChangeEvent, lazy, useState } from "react"
import { useId } from "react-use-id-hook"
import Suspense from "../../components/ui/Suspense"
const SilkQRCode = lazy(() => import("../../components/widgets/SilkQrCode"))

export default function DeviceQRCodeGenerator() {
    const [url, setURL] = useState(``)
    const [mirror, setMirror] = useState(false)
    const [size, setSize] = useState(0.3)
    const handleUrlChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const vanity = ev.target.value?.toUpperCase()
        setURL(vanity)
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
    return (
        <>
            <h1>Device Silk QR Code generator</h1>
            <p>Enter a short URL to be encoded as a silk compatible QR code.</p>
            <Alert severity="info" sx={{ mb: 1 }}>
                Keep the url as short as possible and use capital letters to get
                the smallest QR code.
            </Alert>
            <Grid container spacing={1}>
                <Grid item xs>
                    <TextField
                        fullWidth={true}
                        label="url"
                        value={url}
                        placeholder=""
                        onChange={handleUrlChange}
                        helperText={"Short URL, capital letters best"}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label="block size (mm)"
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
            </Grid>
            {url && (
                <>
                    <h2>URL</h2>
                    <pre>
                        <a href={url}>{url}</a>
                    </pre>
                    <h2>QR codes</h2>
                    <Suspense>
                        <SilkQRCode url={url} mirror={mirror} size={size} />
                    </Suspense>
                </>
            )}
        </>
    )
}
