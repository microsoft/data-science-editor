/* eslint-disable jsx-a11y/no-autofocus */
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    List,
    ListItem,
    TextField,
} from "@mui/material"
import AppContext from "../AppContext"
import React, { useContext, useMemo } from "react"
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
import { useMiniSearch } from "react-minisearch"
import {
    isSensor,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"

const miniSearchOptions = {
    fields: ["name", "description"],
    searchOptions: {
        fuzzy: true,
        prefix: true,
        boost: { name: 5, description: 1 },
    },
}
export default function StartSimulatorDialog(props: {
    open: boolean
    onClose: () => void
    sensor: boolean
}) {
    const { open, onClose, sensor } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { enqueueSnackbar } = useContext(AppContext)
    const { addHostedSimulator } = useContext(HostedSimulatorsContext)
    const { trackEvent } = useAnalytics()
    const { mobile } = useMediaQueries()
    const searchId = useId()
    const deviceHostDialogId = useId()
    const deviceHostLabelId = useId()

    const documents: {
        id: string
        name: string
        description: string
        server?: ServiceProviderDefinition
        simulator?: HostedSimulatorDefinition
    }[] = useMemo(
        () => [
            ...servers()
                .filter(
                    server =>
                        !sensor ||
                        server.serviceClasses.some(sc =>
                            isSensor(
                                serviceSpecificationFromClassIdentifier(sc)
                            )
                        )
                )
                .map(server => ({
                    id: `server:${server.name}`,
                    name: server.name,
                    description: server.serviceClasses
                        .map(serviceSpecificationFromClassIdentifier)
                        .map(
                            spec =>
                                `${spec.name} ${spec.shortName} ${spec.notes["short"]}`
                        )
                        .join(", "),
                    server,
                })),
            ...hostedSimulatorDefinitions()
                .filter(() => !sensor)
                .map(simulator => ({
                    id: `sim:${simulator.name}`,
                    name: simulator.name,
                    description: simulator.url,
                    simulator,
                })),
        ],
        [sensor]
    )
    const { search, searchResults } = useMiniSearch(
        documents,
        miniSearchOptions
    )
    const handleSearchChange = event => {
        search(event.target.value)
    }

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
    const handleAddAll = async () => {
        const allProviderDefinitions = uniqueMap(
            servers().filter(hd => hd.serviceClasses.length === 1),
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
            scroll="paper"
        >
            <DialogTitleWithClose onClose={onClose} id={deviceHostLabelId}>
                Start a simulator
            </DialogTitleWithClose>
            <DialogContent>
                <TextField
                    id={searchId}
                    sx={{ mt: "8px" }}
                    label="Filter simulators"
                    inputProps={{
                        "aria-label":
                            "Filter textbox for simulators",
                    }}
                    type="search"
                    fullWidth={true}
                    size="small"
                    autoFocus={true}
                    onChange={handleSearchChange}
                />
                <List sx={{ height: mobile ? undefined : "min(32rem, 80vh)" }}>
                    {(searchResults || documents).map(
                        ({ id, name, server, simulator }) => (
                            <ListItem
                                button
                                key={id}
                                onClick={
                                    server
                                        ? handleProviderDefinition(server)
                                        : handleHostedSimulator(simulator)
                                }
                            >
                                {name}
                            </ListItem>
                        )
                    )}
                </List>
            </DialogContent>
            {Flags.diagnostics && (
                <DialogActions>
                    {Flags.diagnostics && (
                        <Button variant="outlined" onClick={handleAddAll}>
                            start all simulators
                        </Button>
                    )}
                </DialogActions>
            )}
        </Dialog>
    )
}
