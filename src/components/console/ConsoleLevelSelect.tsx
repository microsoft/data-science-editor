import React, { useContext } from "react"
import {
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
} from "@mui/material"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"
import { LoggerPriority } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useId } from "react"

export default function ConsoleLevelSelect() {
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
                        <Typography variant="caption">
                            {LoggerPriority[level]}
                        </Typography>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
