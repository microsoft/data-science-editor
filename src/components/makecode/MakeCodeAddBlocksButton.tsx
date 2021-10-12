import { Box } from "@material-ui/core"
import { Button } from "gatsby-theme-material-ui"
import React, { useContext, useMemo } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"
import IFrameBridgeClient from "./iframebridgeclient"
import MakeCodeIcon from "../../components/icons/MakeCodeIcon"

export default function MakeCodeAddBlocksButton() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const iframeBridge = bus.nodeData[
        IFrameBridgeClient.DATA_ID
    ] as IFrameBridgeClient
    const extensions = useChange(iframeBridge, _ => _?.candidateExtensions)
    const handleAdd = () => iframeBridge?.postAddExtensions()
    const isMakeCodeTool = useMemo(
        () =>
            typeof window !== "undefined" &&
            /makecode/.test(window.location.href),
        []
    )

    if (!isMakeCodeTool || !extensions?.length) return null
    return (
        <Box m={1}>
            <Button
                size="medium"
                color="primary"
                variant="contained"
                startIcon={<MakeCodeIcon />}
                onClick={handleAdd}
                aria-label={"Add blocks"}
            >
                Add blocks
            </Button>
        </Box>
    )
}
