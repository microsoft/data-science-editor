import { Grid } from "@mui/material"
import React from "react"
import DashboardDeviceItem from "../../components/dashboard/DashboardDeviceItem"
import TestTreeView from "./TestTreeView"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { TestNode } from "../../../jacdac-ts/src/testdom/nodes"
import { FlashDeviceButton } from "../../components/firmware/FlashDeviceButton"
import useDeviceFirmwareBlob from "../../components/firmware/useDeviceFirmwareBlob"
import { useDeviceTestExporter } from "./DeviceTestExporter"
import useChange from "../../jacdac/useChange"
import { TestUploadState } from "../../../jacdac-ts/src/testdom/spec"
import TestUploadStateIcon from "./TestUploadStateIcon"
import TestUploadStateMessage from "./TestUploadStateMessage"

export default function DeviceTestItem(props: {
    test: TestNode
    device: JDDevice
    autoUpdate?: boolean
}) {
    const { device, test, autoUpdate } = props
    const blob = useDeviceFirmwareBlob(device)
    const uploadState = useChange(test, _ => _?.uploadState)

    useDeviceTestExporter(test)

    return (
        <Grid container spacing={1}>
            <DashboardDeviceItem
                key={device.id}
                device={device}
                showAvatar={true}
                showHeader={true}
                showReset={true}
            />
            <Grid item xs>
                <Grid container direction="column" spacing={1}>
                    {blob && (
                        <Grid item>
                            <FlashDeviceButton
                                device={device}
                                blob={blob}
                                hideUpToDate={true}
                                autoStart={autoUpdate}
                            />
                        </Grid>
                    )}
                    {test && (
                        <Grid item xs={12}>
                            <TestTreeView
                                test={test}
                                skipPanel={true}
                                defaultExpanded={true}
                            />
                        </Grid>
                    )}
                    {uploadState !== TestUploadState.Local && (
                        <Grid item xs={12}>
                            <Grid container spacing={1} direction="row">
                                <Grid item>
                                    <TestUploadStateIcon node={test} />
                                </Grid>
                                <Grid item>
                                    <TestUploadStateMessage node={test} />
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </Grid>
    )
}
