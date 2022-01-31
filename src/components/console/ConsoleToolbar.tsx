import React, { ChangeEvent, useContext } from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import ConsoleContext, { serializeLogs } from "./ConsoleContext"
import ConsoleImportSourceMapButton from "./ConsoleImportSourceMapButton"
import ConsoleSerialButton from "./ConsoleSerialButton"
import ClearIcon from "@mui/icons-material/Clear"
import SaveAltIcon from "@mui/icons-material/SaveAlt"
import {
    FormControl,
    Grid,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"
import { LoggerPriority } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useId } from "react-use-id-hook"
import ServiceManagerContext from "../ServiceManagerContext"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"

function ClearButton() {
    const { clear } = useContext(ConsoleContext)
    return (
        <IconButtonWithTooltip title="clear" onClick={clear}>
            <ClearIcon />
        </IconButtonWithTooltip>
    )
}

function SaveButton() {
    const { logs } = useContext(ConsoleContext)
    const { fileStorage } = useContext(ServiceManagerContext)
    const handleSave = () => {
        fileStorage.saveText("jacdac-console.txt", serializeLogs(logs))
    }
    return (
        <IconButtonWithTooltip title="save" onClick={handleSave}>
            <SaveAltIcon />
        </IconButtonWithTooltip>
    )
}

function PopOutButton() {
    return (
        <IconButtonWithTooltip title="pop out" to="/tools/console/">
            <OpenInNewIcon />
        </IconButtonWithTooltip>
    )
}

function MinLoggerPrioritySelect() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const selectId = useId()
    const value = useChange(bus, _ => _.minLoggerPriority)
    const levels = [
        LoggerPriority.Debug,
        LoggerPriority.Log,
        LoggerPriority.Warning,
        LoggerPriority.Error,
        LoggerPriority.Silent,
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (event: SelectChangeEvent<LoggerPriority>) => {
        bus.minLoggerPriority = event.target.value as LoggerPriority
        console.debug(
            `bus min logger priority: ${LoggerPriority[bus.minLoggerPriority]}`
        )
    }

    return (
        <FormControl
            style={{ marginTop: "0.25rem" }}
            variant="outlined"
            size="small"
        >
            <Select
                id={selectId}
                title="log level"
                value={value}
                onChange={handleChange}
            >
                {levels.map(level => (
                    <MenuItem key={level} value={level}>
                        {LoggerPriority[level]}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

function SearchKeywordField() {
    const { searchKeywords, setSearchKeywords } = useContext(ConsoleContext)
    const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setSearchKeywords(ev.target.value)
    }
    return (
        <TextField
            style={{ marginTop: "0.25rem" }}
            type="search"
            variant="outlined"
            size="small"
            placeholder="filter"
            title="Enter search keywords"
            value={searchKeywords || ""}
            onChange={handleChange}
        />
    )
}

export default function ConsoleToolbar() {
    const { sourceMap } = useContext(ConsoleContext)
    return (
        <Grid sx={{ mb: 0.5 }} container spacing={1} direction="row">
            <Grid item>
                <ConsoleSerialButton />
            </Grid>
            <Grid item>
                <ClearButton />
            </Grid>
            <Grid item>
                <SaveButton />
            </Grid>
            <Grid item>
                <ConsoleImportSourceMapButton />
            </Grid>
            <Grid item>
                <SearchKeywordField />
            </Grid>
            <Grid item>
                <MinLoggerPrioritySelect />
            </Grid>
            <Grid item>
                <PopOutButton />
            </Grid>
            <Grid item>{!!sourceMap && "source map loaded"}</Grid>
        </Grid>
    )
}
