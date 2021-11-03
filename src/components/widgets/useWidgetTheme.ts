import { useTheme } from "@mui/material"
import { SVGProps, useContext } from "react"
import DarkModeContext from "../ui/DarkModeContext"

export default function useWidgetTheme(color?: "primary" | "secondary") {
    const theme = useTheme()
    const { palette } = theme
    const { background } = palette
    const { darkMode } = useContext(DarkModeContext)

    const active: string =
        color === "primary"
            ? palette.primary.main
            : color === "secondary"
            ? palette.secondary.main
            : palette.info.main
    const backgroundColor =
        darkMode === "dark" ? background.default : palette.grey[800]
    const controlBackground =
        darkMode === "dark" ? palette.grey[800] : palette.grey[400]
    const textPrimary = palette.text.primary
    const textProps: SVGProps<SVGTextElement> = {
        fill: textPrimary,
        alignmentBaseline: "central",
        dominantBaseline: "middle",
        textAnchor: "middle",
        pointerEvents: "none",
        letterSpacing: 0,
        style: {
            userSelect: "none",
            pointerEvents: "none",
        },
    }

    return {
        background: backgroundColor,
        controlBackground,
        active,
        textPrimary,
        textProps,
    }
}
