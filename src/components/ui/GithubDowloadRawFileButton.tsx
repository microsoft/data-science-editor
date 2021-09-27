import { ButtonProps } from "@material-ui/core"
import { Button } from "gatsby-material-ui-components"
import React, { ReactNode, useContext } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import ServiceManagerContext from "../ServiceManagerContext"

export default function GithubDowloadRawFileButton(
    props: {
        url: string
        name: string
        children?: ReactNode
        disconnect?: boolean
    } & ButtonProps
) {
    const { url, name, children, disconnect, ...rest } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { fileStorage } = useContext(ServiceManagerContext)
    const handleClick = async () => {
        if (disconnect) await bus.disconnect()
        const req = await fetch(url)
        const text = await req.text()
        fileStorage.saveText(name, text)
    }
    return (
        <Button {...rest} onClick={handleClick}>
            {children || "Download"}
        </Button>
    )
}
