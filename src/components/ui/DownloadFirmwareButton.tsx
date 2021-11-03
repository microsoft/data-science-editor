import { ButtonProps } from "@mui/material"
import { Button } from "gatsby-material-ui-components"
import React, { ReactNode, useContext } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

export default function DownloadFirmwareButton(
    props: {
        url: string
        name: string
        children?: ReactNode
    } & ButtonProps
) {
    const { url, children, ...rest } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const handleClick = async () => await bus.disconnect()
    return (
        <Button {...rest} href={url} onClick={handleClick}>
            {children || "Download"}
        </Button>
    )
}
