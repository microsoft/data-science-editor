import { Box, Button, Switch, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
// tslint:disable-next-line: no-submodule-imports
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context";
import Alert from "../ui/Alert";
import DbContext, { DbContextProps } from "../DbContext";
// tslint:disable-next-line: match-default-export-name tslint:disable-next-line: no-submodule-imports
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { useSnackbar } from "notistack";

export default function SafeBootAlert() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { db } = useContext<DbContextProps>(DbContext)
    const { enqueueSnackbar } = useSnackbar();
    const [safeBoot, setSafeBoot] = useState(bus.safeBoot);
    const firmwares = db?.firmwares;

    const handleRecovery = async () => {
        const v = !safeBoot;
        setSafeBoot(v);
    }
    const handleClear = async () => {
        await firmwares.clear();
        enqueueSnackbar("firmwares cleared", {
            variant: "info"
        })
    }

    // turn on and off safeboot mode
    useEffect(() => {
        bus.safeBoot = safeBoot;
        return () => { bus.safeBoot = false }
    }, [safeBoot]);

    return (<>
        <Alert severity="info">
            <Switch value={safeBoot} onChange={handleRecovery} />
            <Typography component="span" variant="body1">
                recovery mode
                </Typography>
            <Box mr={1}>
                <Typography component="span" variant="caption">
                    If your module is malfunctioning from the start, you can flash it in bootloader mode.
                    Turn on recovery mode and unplug/replug any malfunctioning device to switch it to bootloader mode (glowing status LED).
                    Once your module is flashed, turn off recovery mode and unplug/replug your module again.
                    </Typography>
            </Box>
        </Alert>
        {safeBoot && <Alert severity="warning">
            <Button size="small" variant="outlined" disabled={!firmwares} onClick={handleClear} startIcon={<DeleteForeverIcon />}>
                clear cache
            </Button>
            <Box mr={1}>
                <Typography component="span" variant="caption">
                    Delete all firmware cached in the browser. The firmware will have to be deleted again from this interface.
                    </Typography>
            </Box>
        </Alert>}
    </>)
}
