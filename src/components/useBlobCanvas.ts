import { useState } from "react"
import useEffectAsync from "./useEffectAsync"

function readBlobToCanvas(
    blob: Blob,
    width: number,
    height: number
): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
            URL.revokeObjectURL(url)

            const cvs = document.createElement("canvas")
            cvs.width = width
            cvs.height = height
            const ctx = cvs.getContext("2d")

            // compute center of image to be copied into canvas
            const cw = cvs.width
            const ch = cvs.height
            const car = cw / ch
            const iw = img.width
            const ih = img.height
            const iar = iw / ih
            let sx = 0,
                sy = 0,
                sw = iw,
                sh = ih

            //console.log(`image (${iw}x${ih}:${iar}), target (${cw}x${ch}:${car})`)
            if (iar > car) {
                const dw = iw * (1 - car / iar)
                sx = dw >> 1
                sw = iw - dw
                //console.log({ dw, sx, sw })
            } else if (iar < car) {
                // klip top
                const dh = ih * (1 - iar / car)
                sy = dh >> 1
                sh = ih - dh
                //console.log({ dh, sy, sh })
            }
            //console.log({ sx, sy, sw, sh, cw, ch })
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)

            // done
            resolve(cvs)
        }
        img.onerror = () => {
            // error
            URL.revokeObjectURL(url)
            reject(undefined)
        }
        img.src = url
    })
}

export default function useBlobCanvas(
    blob: Blob,
    width: number,
    height: number
) {
    const [canvas, setCanvas] = useState<HTMLCanvasElement>(undefined)
    useEffectAsync(async () => {
        if (!blob) setCanvas(undefined)
        else {
            try {
                const cvs = await readBlobToCanvas(blob, width, height)
                setCanvas(cvs)
            } catch (e) {
                setCanvas(undefined)
            }
        }
    }, [blob, width, height])
    return canvas
}
