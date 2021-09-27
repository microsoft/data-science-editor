import { ButtonProps } from "@material-ui/core"
import { Button } from "gatsby-material-ui-components"
import React, { ReactNode, useContext } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import AppContext from "../AppContext"
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
    const { setError } = useContext(AppContext)
    const { fileStorage } = useContext(ServiceManagerContext)
    const handleClick = async () => {
        if (disconnect) await bus.disconnect()
        try {
            const req = await fetch(url)
            const text = await req.text()
            fileStorage.saveText(name, text)
        } catch (e) {
            setError(e)
        }
    }
    return (
        <Button {...rest} onClick={handleClick}>
            {children || "Download"}
        </Button>
    )
}
