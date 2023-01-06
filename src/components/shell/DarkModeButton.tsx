import React, { useContext } from "react"
import DarkModeContext from "./DarkModeContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import LightModeIcon from "@mui/icons-material/LightMode"
import DarkModeIcon from "@mui/icons-material/DarkMode"

export default function DarkModeButton() {
    const { darkMode, toggleDarkMode } = useContext(DarkModeContext)
    const handleClick = () => toggleDarkMode()
    return (
        <IconButtonWithTooltip
            color="inherit"
            title={darkMode === "dark" ? "Use light mode" : "Use dark mode"}
            onClick={handleClick}
        >
            {darkMode === "light" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButtonWithTooltip>
    )
}
