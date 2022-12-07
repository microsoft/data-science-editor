import React, { useContext } from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import ConsoleContext from "./ConsoleContext"
import ClearIcon from "@mui/icons-material/Clear"

export default function ConsoleClearButton() {
    const { clear } = useContext(ConsoleContext)
    return (
        <IconButtonWithTooltip title="clear" onClick={clear}>
            <ClearIcon />
        </IconButtonWithTooltip>
    )
}
