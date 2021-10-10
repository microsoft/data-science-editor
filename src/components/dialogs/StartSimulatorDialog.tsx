import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    TextField,
} from "@material-ui/core"
import AppContext from "../AppContext"
import React, { ChangeEvent, useContext, useMemo, useState } from "react"
import { useId } from "react-use-id-hook"
import servers, {
    addServiceProvider,
    ServiceProviderDefinition,
} from "../../../jacdac-ts/src/servers/servers"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { delay, uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useMediaQueries from "../hooks/useMediaQueries"
import HostedSimulatorsContext, {
    HostedSimulatorDefinition,
    hostedSimulatorDefinitions,
} from "../HostedSimulatorsContext"
import useAnalytics from "../hooks/useAnalytics"
import { useDebounce } from "use-debounce"
import {
    serviceSpecificationFromClassIdentifier,
    serviceSpecifications,
} from "../../../jacdac-ts/src/jdom/spec"

export default function StartSimulatorDialog(props: {
    open: boolean
    onClose: () => void
}) {
    const { open, onClose } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [query, setQuery] = useState("")
    const { enqueueSnackbar } = useContext(AppContext)
    const { addHostedSimulator } = useContext(HostedSimulatorsContext)
    const { trackEvent } = useAnalytics()
    const searchId = useId()
    const deviceHostDialogId = useId()
    const deviceHostLabelId = useId()

    const [dquery] = useDebounce(query.toLowerCase(), 500)
    const providerDefinitions = useMemo(
        () =>
            servers().filter(
                server =>
                    !dquery || server.name.toLowerCase().indexOf(dquery) > -1
            ),
        [dquery]
    )
    const simulatorDefinitions = useMemo(
        () =>
            hostedSimulatorDefinitions().filter(
                sim => !dquery || sim.name.toLowerCase().indexOf(dquery) > -1
            ),
        [dquery]
    )
    const { mobile } = useMediaQueries()

    const handleProviderDefinition =
        (provider: ServiceProviderDefinition) => () => {
            trackEvent("dashboard.server.start", { server: provider.name })
            addServiceProvider(bus, provider)
            onClose()
        }
    const handleHostedSimulator =
        (simulator: HostedSimulatorDefinition) => () => {
            trackEvent("dashboard.sim.start", { simulator: simulator.name })
            addHostedSimulator(simulator)
            onClose()
        }
    const handleQuery = (ev: ChangeEvent<HTMLInputElement>) =>
        setQuery(ev.target.value)
    const handleCancel = () => {
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
            fullWidth={true}
            fullScreen={mobile}
        >
            <DialogTitle id={deviceHostLabelId}>Start a simulator</DialogTitle>
            <DialogContent>
                <TextField
                    id={searchId}
                    label="Filter"
                    type="search"
                    fullWidth={true}
                    value={query}
                    onChange={handleQuery}
                />
                <List>
                    {providerDefinitions.map(host => (
                        <ListItem
                            button
                            key={host.name}
                            onClick={handleProviderDefinition(host)}
                        >
                            {host.name}
                        </ListItem>
                    ))}
                    {simulatorDefinitions.map(host => (
                        <ListItem
                            button
                            key={host.name}
                            onClick={handleHostedSimulator(host)}
                        >
                            {host.name}
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                {Flags.diagnostics && (
                    <Button variant="outlined" onClick={handleAddAll}>
                        start all simulators
                    </Button>
                )}
                <Button
                    aria-label={`cancel`}
                    variant="outlined"
                    title="Cancel"
                    onClick={handleCancel}
                >
                    cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}
