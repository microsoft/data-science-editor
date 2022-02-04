import React, { useState } from "react"
import FileCopyIcon from "@mui/icons-material/FileCopy"
import DoneIcon from "@mui/icons-material/Done"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import IconButtonWithTooltip from "./IconButtonWithTooltip"
import { Button } from "@mui/material"
import useMounted from "../hooks/useMounted"
import { delay } from "../../../jacdac-ts/src/jdom/utils"


export default function CopyButton(props: {
    label?: string
    title?: string
    onCopy: () => Promise<string | HTMLCanvasElement>
    className?: string
    size?: "small",
    variant?: "outlined" | "contained"
}) {
    const { label, title = "copy data to clipboard", onCopy, ...rest } = props
    const [copied, setCopied] = useState<boolean>(undefined)
    const mounted = useMounted()
    const handleClick = async (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation()
        ev.preventDefault()

        try {
            setCopied(null)
            const copied = await onCopy()
            if (typeof copied === "string") {
                const text = copied as string
                await navigator.clipboard.writeText(text)
            } else {
                const canvas = copied as HTMLCanvasElement
                const blob = await new Promise<Blob>(resolve =>
                    canvas.toBlob(blob => resolve(blob))
                )
                const item = new ClipboardItem({ "image/png": blob })
                navigator.clipboard.write([item])
            }
            if (mounted()) setCopied(true)
        } catch (e) {
            console.debug(e)
            if (mounted()) setCopied(false)
        } finally {
            await delay(1000)
            if (mounted()) setCopied(undefined)
        }
    }
    const disabled = copied !== undefined
    const text =
        copied === true
            ? "Copied!"
            : copied === false
            ? "Copy failed"
            : label || "copy to clipboard"
    return label ? (
        <Button
            title={title}
            {...rest}
            onClick={disabled ? undefined : handleClick}
        >
            {text}
        </Button>
    ) : (
        <IconButtonWithTooltip
            trackName="ui.copy"
            title={text}
            {...rest}
            onClick={disabled ? undefined : handleClick}
        >
            {copied === true ? (
                <DoneIcon />
            ) : copied === false ? (
                <ReportProblemIcon />
            ) : (
                <FileCopyIcon />
            )}
        </IconButtonWithTooltip>
    )
}
