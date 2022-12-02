import {
    Grid,
    TextField,
} from "@mui/material"
import React, {
    useContext,
    useState,
    useId,
} from "react"
import SearchIcon from "@mui/icons-material/Search"
import useChange from "../../jacdac/useChange"
import BrainManagerContext from "./BrainManagerContext"
import GridHeader from "../ui/GridHeader"
import CmdButton from "../CmdButton"
import RefreshIcon from "@mui/icons-material/Refresh"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { useDebounce } from "use-debounce"
import BrainDeviceCard from "./BrainDeviceCard"

export default function BrainDeviceGridItems() {
    const { brainManager } = useContext(BrainManagerContext)
    const id = useId()
    const searchId = id + "-search"
    const [search, setSearch] = useState(false)
    const [query, setQuery] = useState("")
    const [debouncedFilter] = useDebounce(query, 200)
    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        setQuery(event.target.value || "")

    const brains = useChange(
        brainManager,
        _ =>
            _?.devices()?.filter(
                d =>
                    !search ||
                    d.name.indexOf(debouncedFilter) > -1 ||
                    d.deviceId.indexOf(debouncedFilter) > -1
            ),
        [debouncedFilter]
    )

    const handleRefresh = () => brainManager?.refreshDevices()
    const handleSearchClick = () => setSearch(!search)
    return (
        <>
            <GridHeader
                title="Devices"
                action={
                    <>
                        <CmdButton
                            onClick={handleRefresh}
                            icon={<RefreshIcon />}
                            disabled={!brainManager}
                        />
                        <IconButtonWithTooltip
                            title={search ? "hide search" : "show search"}
                            onClick={handleSearchClick}
                        >
                            <SearchIcon />
                        </IconButtonWithTooltip>
                    </>
                }
            />
            {search && (
                <Grid item xs={12}>
                    <TextField
                        id={searchId}
                        margin="dense"
                        type="search"
                        size="small"
                        variant="outlined"
                        label="Search devices"
                        aria-label="Search devices"
                        fullWidth={true}
                        value={query}
                        onChange={handleQueryChange}
                    />
                </Grid>
            )}
            {brains?.map(brain => (
                <Grid item key={brain.id} xs={12} sm={6}>
                    <BrainDeviceCard brain={brain} />
                </Grid>
            ))}
        </>
    )
}