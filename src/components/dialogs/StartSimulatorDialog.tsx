import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    TextField,
} from "@mui/material"
import AppContext from "../AppContext"
import React, { useContext, useMemo, useState } from "react"
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
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import FilterListIcon from "@mui/icons-material/FilterList"

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
}) {
    const { open, onClose } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { enqueueSnackbar } = useContext(AppContext)
    const { addHostedSimulator } = useContext(HostedSimulatorsContext)
    const { trackEvent } = useAnalytics()
    const { mobile } = useMediaQueries()
    const searchId = useId()
    const deviceHostDialogId = useId()
    const deviceHostLabelId = useId()
    const [showFilters, setShowFilters] = useState(false)

    const documents: {
        id: string
        name: string
        description: string
        server?: ServiceProviderDefinition
        simulator?: HostedSimulatorDefinition
    }[] = useMemo(
        () => [
            ...servers().map(server => ({
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
            ...hostedSimulatorDefinitions().map(simulator => ({
                id: `sim:${simulator.name}`,
                name: simulator.name,
                description: simulator.url,
                simulator,
            })),
        ],
        []
    )
    const { search, clearSearch, searchResults } = useMiniSearch(
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
    const handleCancel = () => onClose()
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
    const handleShowFilters = () => {
        if (showFilters) {
            clearSearch()
            setShowFilters(false)
        }
        setShowFilters(!showFilters)
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
            <DialogTitle id={deviceHostLabelId}>
                Start a simulator
                <IconButtonWithTooltip
                    title={showFilters ? "show filters" : "hide filters"}
                    onClick={handleShowFilters}
                >
                    <FilterListIcon />
                </IconButtonWithTooltip>
            </DialogTitle>
            <DialogContent>
                {showFilters && (
                    <TextField
                        id={searchId}
                        label="Filter"
                        type="search"
                        fullWidth={true}
                        onChange={handleSearchChange}
                    />
                )}
                <List>
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
            {!mobile && (
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
            )}
        </Dialog>
    )
}
