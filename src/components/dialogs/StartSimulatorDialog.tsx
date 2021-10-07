import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
} from "@material-ui/core"
import AppContext from "../AppContext"
import React, { useContext, useMemo, useState } from "react"
import { useId } from "react-use-id-hook"
import servers, {
    addServiceProvider,
} from "../../../jacdac-ts/src/servers/servers"
import { VIRTUAL_DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { delay, uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import KindIcon from "../KindIcon"
import SelectWithLabel from "../ui/SelectWithLabel"
import useMediaQueries from "../hooks/useMediaQueries"
import HostedSimulatorsContext, {
    hostedSimulatorDefinitions,
} from "../HostedSimulatorsContext"
import useAnalytics from "../hooks/useAnalytics"

export default function StartSimulatorDialog(props: {
    open: boolean
    onClose: () => void
}) {
    const { open, onClose } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { enqueueSnackbar } = useContext(AppContext)
    const { addHostedSimulator } = useContext(HostedSimulatorsContext)
    const { trackEvent } = useAnalytics()
    const deviceHostDialogId = useId()
    const deviceHostLabelId = useId()

    const [selected, setSelected] = useState("button")
    const providerDefinitions = useMemo(() => servers(), [])
    const simulatorDefinitions = useMemo(() => hostedSimulatorDefinitions(), [])
    const { mobile } = useMediaQueries()

    const handleChange = (ev: React.ChangeEvent<{ value: unknown }>) => {
        setSelected(ev.target.value as string)
    }
    const handleCancel = () => {
        onClose()
    }
    const handleStart = () => {
        const provider = providerDefinitions.find(h => h.name === selected)
        if (provider) {
            trackEvent("dashboard.server.start", { server: selected })
            addServiceProvider(bus, provider)
        }
        const simulator = simulatorDefinitions.find(h => h.name === selected)
        if (simulator) {
            trackEvent("dashboard.sim.start", { simulator: selected })
            addHostedSimulator(simulator)
        }
        onClose()
    }
    const handleAddAll = async () => {
        const allProviderDefinitions = uniqueMap(
            providerDefinitions.filter(hd => hd.serviceClasses.length === 1),
            hd => hd.serviceClasses[0].toString(),
            h => h
        )
        enqueueSnackbar(
            `starting ${allProviderDefinitions.length} simulators...`,
            `info`
        )
        onClose()
        for (const provider of allProviderDefinitions) {
            await delay(100)
            addServiceProvider(bus, provider)
        }
    }

    return (
        <Dialog
            id={deviceHostDialogId}
            aria-labelledby={deviceHostLabelId}
            open={open}
            onClose={onClose}
            fullScreen={mobile}
        >
            <DialogTitle id={deviceHostLabelId}>Start a simulator</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <SelectWithLabel
                            fullWidth={true}
                            helperText={"Select the device to simulate"}
                            label={"Simulator"}
                            value={selected}
                            onChange={handleChange}
                        >
                            {providerDefinitions.map(host => (
                                <MenuItem key={host.name} value={host.name}>
                                    {host.name}
                                </MenuItem>
                            ))}
                            {simulatorDefinitions.map(host => (
                                <MenuItem key={host.name} value={host.name}>
                                    {host.name}
                                </MenuItem>
                            ))}
                        </SelectWithLabel>
                    </Grid>
                    <Grid item>
                        <Grid container spacing={1}>
                            {mobile && (
                                <Grid item>
                                    <Button
                                        aria-label={`cancel`}
                                        variant="contained"
                                        title="Cancel"
                                        onClick={handleCancel}
                                    >
                                        cancel
                                    </Button>
                                </Grid>
                            )}
                            <Grid item>
                                <Button
                                    aria-label={`start ${selected}`}
                                    color="primary"
                                    variant="contained"
                                    title="Start new simulator"
                                    onClick={handleStart}
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
