import { Box, Button, Typography } from "@material-ui/core"
import React, { useContext, useEffect, useState } from "react"
// tslint:disable-next-line: no-submodule-imports
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import Alert from "../ui/Alert"
import DbContext, { DbContextProps } from "../DbContext"
// tslint:disable-next-line: match-default-export-name tslint:disable-next-line: no-submodule-imports
import DeleteForeverIcon from "@material-ui/icons/DeleteForever"
import AppContext from "../AppContext"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import {
    ControlCmd,
    SRV_CONTROL,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"

export default function SafeBootAlert() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { db } = useContext<DbContextProps>(DbContext)
    const { enqueueSnackbar } = useContext(AppContext)
    const [safeBoot, setSafeBoot] = useState(bus.safeBoot)
    const firmwares = db?.firmwares

    const handleRecovery = async () => {
        const v = !safeBoot
        setSafeBoot(v)
    }
    const handleClear = async () => {
        await firmwares.clear()
        enqueueSnackbar("firmwares cleared", "info")
    }

    // turn on and off safeboot mode
    useEffect(() => {
        bus.safeBoot = safeBoot
        if (safeBoot) {
            // tell all brains to enter proxy mode
            const pkt = Packet.onlyHeader(ControlCmd.Proxy)
            pkt.sendAsMultiCommandAsync(bus, SRV_CONTROL)
        }
        return () => {
            bus.safeBoot = false
        }
    }, [safeBoot])

    return (
        <>
            <Alert severity="info">
                <SwitchWithLabel
                    value={safeBoot}
                    onChange={handleRecovery}
                    label={
                        <Typography component="span" variant="body1">
                            recovery mode
                        </Typography>
                    }
                />
                <Box mr={1}>
                    <Typography component="span" variant="caption">
                        If your module is malfunctioning from the start, you can
                        flash it in bootloader mode. Turn on recovery mode and
                        unplug/replug any malfunctioning device to switch it to
                        bootloader mode (glowing status LED). Once your module
                        is flashed, turn off recovery mode and unplug/replug
                        your module again.
                    </Typography>
                </Box>
            </Alert>
            {safeBoot && (
                <Alert severity="warning">
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={!firmwares}
                        onClick={handleClear}
                        startIcon={<DeleteForeverIcon />}
                    >
                        clear cache
                    </Button>
                    <Box mr={1}>
                        <Typography component="span" variant="caption">
                            Delete all firmware cached in the browser. The
                            firmware will have to be deleted again from this
                            interface.
                        </Typography>
                    </Box>
                </Alert>
            )}
        </>
    )
}
