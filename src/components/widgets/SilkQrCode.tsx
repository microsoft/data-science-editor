import { Button, Grid } from "@mui/material"
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
    const [image, setImage] = useState<string>(undefined)
    const [scr, setScr] = useState<string>(undefined)
    const [kicad, setKicad] = useState<string>(undefined)
    const [altium, setAltium] = useState<string>(undefined)
    const [numBlocks, setNumBlocks] = useState<number>(undefined)
    const [error, setError] = useState<string>(undefined)
    const deps = [url, layer, size, mirror, margin]

    useEffect(() => setError(undefined), deps)

    useEffectAsync(async mounted => {
        setImage(undefined)
        setScr(undefined)
        setError(undefined)
        try {
            if (!mounted()) return

            const qr = QRCode.create(url, {
                errorCorrectionLevel: "medium",
            })
            let numBlocks = qr.modules.size
            let ptr = 0
            const code = {}
            for (let y = 0; y < numBlocks; ++y) {
                for (let x = 0; x < numBlocks; ++x) {
                    const xx = !mirror ? numBlocks - x - 1 : x
                    code[`${xx + margin},${numBlocks - y - 1 + margin}`] =
                        !!qr.modules.data[ptr++]
                }
            }
            setNumBlocks(numBlocks)

            const utfcode: string = await QRCode.toString(url, {
                margin: 1,
                scale: 1,
                errorCorrectionLevel: "medium",
                type: "utf8",
            })
            if (!mounted()) return
            setImage(utfcode)

            const f = (v: number) => v.toFixed(3)

            let scr = `# QRCode for ${url} (${numBlocks}x${numBlocks} at ${size}mm)\n`
            scr += `LAYER ${layer};\n`
            scr += `GRID mm;\n`

            const kicadTimestamp = ((Date.now() / 1000) | 0)
                .toString(16)
                .toUpperCase()
            let kicad = `(module QrCode (layer F.Cu) (tedit ${kicadTimestamp})\n`

            let altium =
                "Object Kind\tLayer\tNet\tX1\tY1\tX2\tY2\tKeepout\tLocked\tRotation\tSolder Mask Expansion\tSolder Mask Expansion Mode\tPaste Mask Expansion\tPaste Mask Expansion Mode\r\n"

            numBlocks += 2 * margin
            const mid = (numBlocks * size) / 2

            /*
            kicad +=
                `(fp_text reference QR***** (at 0 ${f(
                    mid
                )}) (layer F.SilkS) hide\n` +
                `(effects (font (size 1 1) (thickness 0.15))))\n` +
                `(fp_text value QrCode (at 0 ${f(
                    -mid
                )}) (layer F.SilkS) hide\n` +
                `(effects (font (size 1 1) (thickness 0.15))))\n`
                */

            for (let y = 0; y < numBlocks; y++) {
                let x = 0
                while (x < numBlocks) {
                    while (code[`${x},${y}`]) x++
                    let xe = x
                    while (xe < numBlocks && !code[`${xe},${y}`]) xe++
                    const x0 = x * size
                    const y0 = y * size
                    const x1 = xe * size
                    const y1 = (y + 1) * size
                    scr += `RECT (R ${f(x0)} ${f(y0)}) (R ${f(x1)} ${f(y1)})\n`

                    const alt = [
                        "Fill",
                        mirror ? "TopOverlay" : "BottomOverlay",
                        "No Net",
                        f(x0),
                        f(y0),
                        f(x1),
                        f(y1),
                        "false",
                        "false",
                        "0.0",
                        "0",
                        "none",
                        "0",
                        "none",
                    ]

                    altium += alt.join("\t") + "\r\n"

                    const kx0 = f(x0 - mid)
                    const ky0 = f(-(y0 - mid))
                    const kx1 = f(x1 - mid)
                    const ky1 = f(-(y1 - mid))
                    kicad += `(fp_poly (pts (xy ${kx0} ${ky0}) (xy ${kx0} ${ky1}) (xy ${kx1} ${ky1}) (xy ${kx1} ${ky0})) (layer F.SilkS) (width 0))\n`

                    x = xe
                }
            }

            const frame = (x0: number, y0: number, x1: number, y1: number) => {
                const q = (n: number) =>
                    (n * ((numBlocks * size) / 2 + 0.0001)).toFixed(4)
                kicad +=
                    `(fp_line (start ${q(x0)} ${q(y0)}) ` +
                    `(end ${q(x1)} ${q(y1)}) ` +
                    `(layer F.CrtYd) (width 0.05))\n`
            }
            frame(-1, -1, -1, 1)
            frame(-1, -1, 1, -1)
            frame(1, 1, -1, 1)
            frame(1, 1, 1, -1)
            kicad += ")\n"

            const max_x = f(numBlocks * size)
            const max_y = f(numBlocks * size)

            scr += `GRID LAST;\n`
            scr += `DISPLAY NONE ?? ${layer};\n`
            scr += `GROUP (0 0) (${max_x} 0) (${max_x} ${max_y}) (0 ${max_y}) (> 0 0);\n`
            scr += `DISPLAY LAST;\n`

            setScr(scr)
            setKicad(kicad)
            setAltium(altium)
        } catch (e) {
            if (mounted()) {
                setError(e + "")
            }
        }
    }, deps)

    return { altium, kicad, scr, image, error, numBlocks }
}

export default function SilkQRCode(props: {
    url: string
    layer?: number
    size?: number
    mirror?: boolean
    margin?: number
}) {
    const { url, layer, mirror = true, size = 0.3, margin = 1 } = props
    const eagleLayer = layer ?? mirror ? 22 : 21
    const { altium, kicad, scr, image, error, numBlocks } = useQRCodeSCR(
        url,
        eagleLayer,
        size,
        mirror,
        margin
    )

    if (!url) return null

    const imageUri =
        image && `data:image/svg+xml;utf8,${encodeURIComponent(image)}`
    const scrUri =
        scr && `data:text/plain;charset=UTF-8,${encodeURIComponent(scr)}`
    const kicadUri =
        kicad && `data:text/plain;charset=UTF-8,${encodeURIComponent(kicad)}`
    const altiumUri =
        altium && `data:text/plain;charset=UTF-8,${encodeURIComponent(altium)}`
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
                            Download SCR for Eagle
                        </Button>
                    </Grid>
                )}
                {kicad && (
                    <Grid item>
                        <Button
                            href={kicadUri}
                            variant="outlined"
                            download="QrCode.kicad_mod"
                        >
                            Download kicad_mod
                        </Button>
                    </Grid>
                )}
                {altium && (
                    <Grid item>
                        <Button
                            href={altiumUri}
                            variant="outlined"
                            download="QrCode.txt"
                        >
                            Download CSV for Altium
                        </Button>
                    </Grid>
                )}
            </Grid>
            {image && (
                <>
                    <h3>Original size</h3>
                    <img
                        className="pixelated"
                        style={{ width: `${size * numBlocks}mm` }}
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
