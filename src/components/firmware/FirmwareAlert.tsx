import { Box, Grid } from "@material-ui/core"
import { AlertTitle } from "@material-ui/lab"
import { Button } from "gatsby-material-ui-components"
import React, { useContext } from "react"
import { updateApplicable } from "../../../jacdac-ts/src/jdom/flashing"
import { inIFrame } from "../../../jacdac-ts/src/jdom/iframeclient"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"
import Alert from "../ui/Alert"

export default function FirmwareAlert() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const updates = useChange(bus, _ => {
        if (inIFrame()) return false

        const blobs = _.firmwareBlobs
        const infos = _.devices({ physical: true }).map(d => d.firmwareInfo)

        return (
            blobs &&
            infos &&
            infos.some(info => blobs.some(blob => updateApplicable(info, blob)))
        )
    })

    if (!updates) return null

    return (
        <Grid item xs={12}>
            <Alert severity="success" closeable={true}>
                <AlertTitle>Updates available</AlertTitle>
                Update your devices to benefit from bug fixes and improvements.
                <Box component="span" ml={1}>
                    <Button variant="outlined" to="/tools/updater/">
                        Review updates
                    </Button>
                </Box>
            </Alert>
        </Grid>
    )
}
