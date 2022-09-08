import { Alert, Grid, TextField } from "@mui/material"
import React, { ChangeEvent, lazy, startTransition, useState } from "react"
import Suspense from "../../components/ui/Suspense"
import SwitchWithLabel from "../../components/ui/SwitchWithLabel"
const SilkQRCode = lazy(() => import("../../components/widgets/SilkQrCode"))

export const frontmatter = {
    title: "Device QR Code Generator",
    description: "Generating QR codes for various PCB design software.",
}
import CoreHead from "../../components/shell/Head"
export const Head = (props) => <CoreHead {...props} {...frontmatter} />

export default function DeviceQRCodeGenerator() {
    const [url, setURL] = useState(``)
    const [mirror, setMirror] = useState(false)
    const [size, setSize] = useState(0.3)
    const [error, setError] = useState("")
    const handleUrlChange = (ev: ChangeEvent<HTMLInputElement>) =>
        startTransition(() => {
            const vanity = (ev.target.value || "").trim().toLocaleUpperCase()
            setURL(vanity)
            setError(
                !/^https?:\/\/./i.test(vanity)
                    ? "Must start with http:// or https://"
                    : undefined
            )
        })
    const handleSizeChange = (ev: ChangeEvent<HTMLInputElement>) =>
        startTransition(() => {
            const s = Number(ev.target.value)
            if (!isNaN(s)) setSize(s)
        })
    const handleMirror = (ev: ChangeEvent<HTMLInputElement>) =>
        startTransition(() => {
            setMirror(!!ev.target.checked)
        })
    return (
        <>
            <h1>Device Silk QR Code generator</h1>
            <p>Enter a short URL to be encoded as a silk compatible QR code.</p>
            <Grid container spacing={1}>
                <Grid item xs>
                    <TextField
                        fullWidth={true}
                        label="url"
                        value={url}
                        placeholder=""
                        onChange={handleUrlChange}
                        error={!!error}
                        helperText={
                            error ||
                            "Use _very_ short URL and only CAPITAL letters and numbers for best results, eg., HTTP://.../123ABC"
                        }
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label="block size (mm)"
                        type="number"
                        value={size}
                        inputProps={{ step: 0.1 }}
                        onChange={handleSizeChange}
                        helperText="Image size equals block size times number of blocks needed to encode URL."
                    />
                </Grid>
                <Grid item>
                    <SwitchWithLabel
                        checked={mirror}
                        onChange={handleMirror}
                        label="mirror"
                    />
                </Grid>
            </Grid>
            <Alert severity="info" sx={{ mb: 1 }}>
                Keep the url as short as possible and use capital letters to get
                the smallest QR code.
            </Alert>
            {url && !error && (
                <>
                    <h2>
                        QR codes for{" "}
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            {url}
                        </a>
                    </h2>
                    <Suspense>
                        <SilkQRCode url={url} mirror={mirror} size={size} />
                    </Suspense>
                </>
            )}
        </>
    )
}
