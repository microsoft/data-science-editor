import React, { useState } from "react"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DoneIcon from "@material-ui/icons/Done"
import ReportProblemIcon from "@material-ui/icons/ReportProblem"
import IconButtonWithTooltip from "./IconButtonWithTooltip"
import { Button } from "@material-ui/core"
import useMounted from "../hooks/useMounted"
import { delay } from "../../../jacdac-ts/src/jdom/utils"

export default function CopyButton(props: {
    label?: string
    title?: string
    onCopy: () => Promise<string>
    className?: string
    size?: "small"
}) {
    const { label, title = "copy data to clipboard", onCopy, ...rest } = props
    const [copied, setCopied] = useState<boolean>(undefined)
    const mounted = useMounted()
    const handleClick = async (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation()
        ev.preventDefault()

        try {
            setCopied(null)
            const text = await onCopy()
            await navigator.clipboard.writeText(text)
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
