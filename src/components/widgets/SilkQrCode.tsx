import { Button, Grid } from "@material-ui/core"
import QRCode from "qrcode"
import React, { useState } from "react"
import { useEffect } from "react"
import useEffectAsync from "../useEffectAsync"
import Alert from "../ui/Alert"

export interface QRCodeProps {
    url: string
    layer?: number
    size?: number
    mirror?: boolean
    margin?: number
}

function useQRCodeSCR(
    url: string,
    layer: number,
    size: number,
    mirror: boolean,
    margin: number
) {
    const fmt = (v: number) => v.toFixed(3)
    const [image, setImage] = useState<string>(undefined)
    const [scr, setScr] = useState<string>(undefined)
    const [error, setError] = useState<string>(undefined)
    const deps = [url, layer, size, mirror, margin]

    useEffect(() => setError(undefined), deps)

    useEffectAsync(async mounted => {
        setImage(undefined)
        setScr(undefined)
        setError(undefined)
        try {
            const utfcode: string = await QRCode.toString(url, {
                margin: 0,
                scale: 1,
                errorCorrectionLevel: "medium",
                type: "utf8",
            })
            if (!mounted()) return
            setImage(utfcode)
            console.debug(`utfcode`, { utfcode })
            const lines = utfcode.split(/\n/).filter(s => !!s)
            let sz = lines[0].length
            const code = {}
            for (let y = 0; y < sz; y += 2) {
                const line = lines[y >> 1]
                for (let x = 0; x < sz; ++x) {
                    const ch = line.charCodeAt(x)
                    let upper = false,
                        lower = false
                    switch (ch) {
                        case 32:
                            break
                        case 9600:
                            upper = true
                            break
                        case 9604:
                            lower = true
                            break
                        case 9608:
                            upper = true
                            lower = true
                            break
                        default:
                            throw new Error("bad char: " + ch)
                    }
                    const xx = !mirror ? sz - x - 1 : x
                    code[`${xx + margin},${sz - y - 1 + margin}`] = upper
                    code[`${xx + margin},${sz - y - 2 + margin}`] = lower
                }
            }

            let scr = `# QRCode for ${url} (${sz}x${sz} at ${size}mm)\n`
            scr += `LAYER ${layer};\n`
            scr += `GRID mm;\n`

            sz += 2 * margin

            for (let y = 0; y < sz; y++) {
                let x = 0
                while (x < sz) {
                    while (code[`${x},${y}`]) x++
                    let xe = x
                    while (xe < sz && !code[`${xe},${y}`]) xe++
                    scr += `RECT (R ${fmt(x * size)} ${fmt(y * size)}) (R ${fmt(
                        xe * size
                    )} ${fmt((y + 1) * size)})\n`
                    x = xe
                }
            }

            const max_x = fmt(sz * size)
            const max_y = fmt(sz * size)

            scr += `GRID LAST;\n`
            scr += `DISPLAY NONE ?? ${layer};\n`
            scr += `GROUP (0 0) (${max_x} 0) (${max_x} ${max_y}) (0 ${max_y}) (> 0 0);\n`
            scr += `DISPLAY LAST;\n`

            console.log("scr", scr)
            setScr(scr)
        } catch (e) {
            if (mounted()) {
                setError(e + "")
            }
        }
    }, deps)

    return { scr, image, error }
}

export default function SilkQRCode(props: {
    url: string
    layer?: number
    size?: number
    mirror?: boolean
    margin?: number
}) {
    const { url, layer = 22, mirror = true, size = 3, margin = 1 } = props
    const { scr, image, error } = useQRCodeSCR(url, layer, size, mirror, margin)

    if (!url) return null

    const imageUri =
        image && `data:image/svg+xml;utf8,${encodeURIComponent(image)}`
    const scrUri =
        scr && `data:text/plain;charset=UTF-8,${encodeURIComponent(scr)}`
    return (
        <>
            {error && <Alert severity="warning">{error}</Alert>}
            <Grid container spacing={1}>
                {imageUri && (
                    <Grid item>
                        <Button
                            href={imageUri}
                            variant="outlined"
                            download="qrcode.svg"
                        >
                            Download SVG
                        </Button>
                    </Grid>
                )}
                {scr && (
                    <Grid item>
                        <Button
                            href={scrUri}
                            variant="outlined"
                            download="qrcode.scr"
                        >
                            Download SCR
                        </Button>
                    </Grid>
                )}
            </Grid>
            {image && (
                <>
                    <h3>Original size</h3>
                    <img
                        className="pixelated"
                        style={{ width: `${size}mm` }}
                        src={imageUri}
                        alt={`QR code of ${url}`}
                    />
                    <h3>Zoomed</h3>
                    <img
                        className="pixelated"
                        style={{ width: `10rem` }}
                        src={imageUri}
                        alt={`QR code of ${url}`}
                    />
                </>
            )}
        </>
    )
}
