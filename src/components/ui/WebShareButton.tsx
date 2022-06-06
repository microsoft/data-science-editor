import React, { CSSProperties } from "react"
import IconButtonWithTooltip from "./IconButtonWithTooltip"
import IosShareIcon from "@mui/icons-material/IosShare"

function currentUrl() {
    return typeof window !== undefined && window.location.href
}

export default function WebShareButton(props: {
    title: string
    text?: string
    url?: string
    style?: CSSProperties
}) {
    const { style, title, text, url = currentUrl() } = props
    const data: ShareData = { title, text, url }

    const handleClick = () => {
        navigator.share(data)
    }

    if (typeof navigator === undefined || !navigator.canShare(data)) return null

    return (
        <IconButtonWithTooltip
            style={style}
            title="share"
            onClick={handleClick}
        >
            <IosShareIcon />
        </IconButtonWithTooltip>
    )
}
