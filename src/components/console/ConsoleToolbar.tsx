import React, { ChangeEvent, startTransition, useContext } from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import ConsoleContext, { serializeLogs } from "./ConsoleContext"
import ConsoleImportSourceMapButton from "./ConsoleImportSourceMapButton"
import ConsoleSerialButton from "./ConsoleSerialButton"
import SaveAltIcon from "@mui/icons-material/SaveAlt"
import { Grid, TextField } from "@mui/material"
import ServiceManagerContext from "../ServiceManagerContext"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import AppContext, { DrawerType } from "../AppContext"
import { navigate } from "gatsby"
import ConsoleLevelSelect from "./ConsoleLevelSelect"
import ConsoleClearButton from "./ConsoleClearButton"

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
    const { setDrawerType } = useContext(AppContext)
    const handlePopOut = () => {
        setDrawerType(DrawerType.None)
        navigate("/tools/console/")
    }
    return (
        <IconButtonWithTooltip title="pop out" onClick={handlePopOut}>
            <OpenInNewIcon />
        </IconButtonWithTooltip>
    )
}

function SearchKeywordField() {
    const { searchKeywords, setSearchKeywords } = useContext(ConsoleContext)
    const handleChange = (ev: ChangeEvent<HTMLInputElement>) =>
        startTransition(() => setSearchKeywords(ev.target.value))
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

export interface ConsoleToolbarOptions {
    showPopout?: boolean
    showFiles?: boolean
    showSerial?: boolean
    showLevel?: boolean
}

export default function ConsoleToolbar(props: ConsoleToolbarOptions) {
    const { sourceMap } = useContext(ConsoleContext)
    const { showPopout, showFiles, showSerial, showLevel } = props
    return (
        <Grid
            sx={{ mb: 0.5 }}
            container
            spacing={1}
            direction="row"
            alignItems="center"
        >
            {showSerial && (
                <Grid item>
                    <ConsoleSerialButton />
                </Grid>
            )}
            <Grid item>
                <ConsoleClearButton />
            </Grid>
            {showFiles && (
                <Grid item>
                    <SaveButton />
                </Grid>
            )}
            {showFiles && (
                <Grid item>
                    <ConsoleImportSourceMapButton />
                </Grid>
            )}
            <Grid item>
                <SearchKeywordField />
            </Grid>
            {showLevel && (
                <Grid item>
                    <ConsoleLevelSelect />
                </Grid>
            )}
            {showPopout && (
                <Grid item>
                    <PopOutButton />
                </Grid>
            )}
            <Grid item>{!!sourceMap && "source map loaded"}</Grid>
        </Grid>
    )
}
