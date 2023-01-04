import React, { ReactNode, useState } from "react"
import FileCopyIcon from "@mui/icons-material/FileCopy"
import DoneIcon from "@mui/icons-material/Done"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import IconButtonWithTooltip from "./IconButtonWithTooltip"
import { Button } from "@mui/material"
import useMounted from "../hooks/useMounted"
import { delay } from "../dom/utils"

export default function CopyButton(props: {
    label?: string
    title?: string
    onCopy?: () => Promise<string | HTMLCanvasElement>
    text?: string
    className?: string
    size?: "small"
    variant?: "outlined" | "contained"
    disabled?: boolean
    copyIcon?: ReactNode
    color?: "success" | "error"
}) {
    const {
        label,
        text,
        title = "copy data to clipboard",
        disabled,
        onCopy,
        copyIcon,
        ...rest
    } = props
    const [copied, setCopied] = useState<boolean>(undefined)
    const mounted = useMounted()
    const handleClick = async (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation()
        ev.preventDefault()

        try {
            setCopied(null)
            const copied = text || (await onCopy?.())
            if (typeof copied === "string") {
                const c = copied as string
                await navigator.clipboard.writeText(c)
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
            await delay(2000)
            if (mounted()) setCopied(undefined)
        }
    }
    const hasCopied = copied !== undefined
    const buttonText =
        copied === true
            ? "Copied!"
            : copied === false
            ? "Copy failed"
            : label || title || "copy to clipboard"
    return label ? (
        <Button
            title={title}
            disabled={disabled || hasCopied}
            {...rest}
            onClick={hasCopied ? undefined : handleClick}
        >
            {buttonText}
        </Button>
    ) : (
        <IconButtonWithTooltip
            trackName="ui.copy"
            title={buttonText}
            {...rest}
            onClick={disabled ? undefined : handleClick}
        >
            {copied === true ? (
                <DoneIcon color="success" />
            ) : copied === false ? (
                <ReportProblemIcon />
            ) : (
                copyIcon || <FileCopyIcon />
            )}
        </IconButtonWithTooltip>
    )
}