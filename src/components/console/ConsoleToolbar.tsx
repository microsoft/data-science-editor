import React, { useContext } from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import ConsoleContext from "./ConsoleContext"
import ConsoleImportSourceMapButton from "./ConsoleImportSourceMapButton"
import ConsoleSerialButton from "./ConsoleSerialButton"
import ClearIcon from "@material-ui/icons/Clear"

function ClearButton() {
    const { clear } = useContext(ConsoleContext)
    return (
        <IconButtonWithTooltip title="clear" onClick={clear}>
            <ClearIcon />
        </IconButtonWithTooltip>
    )
}

export default function ConsoleToolbar() {
    const { sourceMap } = useContext(ConsoleContext)
    return (
        <>
            <ConsoleSerialButton />
            <ConsoleImportSourceMapButton />
            <ClearButton />
            {!!sourceMap && "source map loaded"}
        </>
    )
}
