import { Box } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import React, { useMemo } from "react"
import useChange from "../../jacdac/useChange"
import IFrameBridgeClient from "./iframebridgeclient"
import MakeCodeIcon from "../../components/icons/MakeCodeIcon"
import useBus from "../../jacdac/useBus"
import StartMissingSimulatorsButton from "../buttons/StartMissingSimulatorsButton"

export default function MakeCodeAddBlocksButton() {
    const bus = useBus()
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

    if (!isMakeCodeTool) return null

    return (
        <Box m={1}>
            {!!extensions?.length && (
                <Button
                    sx={{ mr: 1 }}
                    size="medium"
                    color="primary"
                    variant="contained"
                    startIcon={<MakeCodeIcon />}
                    onClick={handleAdd}
                    aria-label={"Add blocks"}
                >
                    Add blocks
                </Button>
            )}
            <StartMissingSimulatorsButton
                hideOnDisabled={true}
                variant="contained"
            >
                Start simulators
            </StartMissingSimulatorsButton>
        </Box>
    )
}
