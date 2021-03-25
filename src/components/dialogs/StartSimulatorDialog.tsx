import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import React, { useContext, useMemo, useState } from "react"
import { useId } from "react-use-id-hook"
import hosts, { addHost } from "../../../jacdac-ts/src/hosts/hosts"
import { VIRTUAL_DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { delay, uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import KindIcon from "../KindIcon"
import SelectWithLabel from "../ui/SelectWithLabel"

export default function StartSimulatorDialog(props: {
    open: boolean
    onClose: () => void
}) {
    const { open, onClose } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const deviceHostDialogId = useId()
    const deviceHostLabelId = useId()

    const [selected, setSelected] = useState("button")
    const { enqueueSnackbar } = useSnackbar()
    const hostDefinitions = useMemo(() => hosts(), [])

    const handleChange = (ev: React.ChangeEvent<{ value: unknown }>) => {
        setSelected(ev.target.value as string)
    }
    const handleClick = () => {
        const host = hostDefinitions.find(h => h.name === selected)
        addHost(bus, host)
        onClose()
    }
    const handleAddAll = async () => {
        const allHostDefinitions = uniqueMap(
            hostDefinitions.filter(hd => hd.serviceClasses.length === 1),
            hd => hd.serviceClasses[0].toString(),
            h => h
        )
        enqueueSnackbar(`starting ${allHostDefinitions.length} simulators...`, {
            variant: "info",
            key: "startdevicehosts",
        })
        onClose()
        for (const host of allHostDefinitions) {
            await delay(100)
            addHost(bus, host)
        }
    }

    return (
        <Dialog
            id={deviceHostDialogId}
            aria-labelledby={deviceHostLabelId}
            open={open}
            onClose={onClose}
        >
            <DialogTitle id={deviceHostLabelId}>
                Start a simulator
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <SelectWithLabel
                            fullWidth={true}
                            helperText={
                                "Select the service that will run on the simulator"
                            }
                            label={"Simulator"}
                            value={selected}
                            onChange={handleChange}
                        >
                            {hostDefinitions.map(host => (
                                <MenuItem key={host.name} value={host.name}>
                                    {host.name}
                                </MenuItem>
                            ))}
                        </SelectWithLabel>
                    </Grid>
                    <Grid item>
                        <Grid container spacing={1}>
                            <Grid item>
                                <Button
                                    aria-label={`start ${selected}`}
                                    color="primary"
                                    variant="contained"
                                    title="Start new simulator"
                                    onClick={handleClick}
                                    startIcon={
                                        <KindIcon
                                            kind={VIRTUAL_DEVICE_NODE_NAME}
                                        />
                                    }
                                >
                                    start
                                </Button>
                            </Grid>
                            {Flags.diagnostics && (
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        onClick={handleAddAll}
                                    >
                                        start all simulators
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}
