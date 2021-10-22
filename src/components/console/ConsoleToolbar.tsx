import React, { ChangeEvent, useContext } from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import ConsoleContext, { serializeLogs } from "./ConsoleContext"
import ConsoleImportSourceMapButton from "./ConsoleImportSourceMapButton"
import ConsoleSerialButton from "./ConsoleSerialButton"
import ClearIcon from "@material-ui/icons/Clear"
import SaveAltIcon from "@material-ui/icons/SaveAlt"
import {
    FormControl,
    Grid,
    MenuItem,
    Select,
    TextField,
} from "@material-ui/core"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"
import { LoggerPriority } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useId } from "react-use-id-hook"
import ServiceManagerContext from "../ServiceManagerContext"

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
    const handleChange = (event: React.ChangeEvent<{ value: any }>) => {
        bus.minLoggerPriority = event.target.value
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
        <Grid container spacing={1} direction="row">
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
                <SearchKeywordField />
            </Grid>
            <Grid item>
                <MinLoggerPrioritySelect />
            </Grid>
            <Grid item>
                <ConsoleImportSourceMapButton />
                {!!sourceMap && "source map loaded"}
            </Grid>
        </Grid>
    )
}
