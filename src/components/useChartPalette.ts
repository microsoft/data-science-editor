import { useContext, useMemo } from "react"
import DarkModeContext from "./ui/DarkModeContext"

export default function useChartPalette(): string[] {
    const { darkMode } = useContext(DarkModeContext)
    const palette = useMemo(() => {
        if (darkMode == "light")
            return [
                "#003f5c",
                "#ffa600",
                "#665191",
                "#a05195",
                "#ff7c43",
                "#d45087",
                "#f95d6a",
                "#2f4b7c",
            ]
        else
            return [
                "#60ccfe",
                "#ffdd9e",
                "#c3b9d8",
                "#dcbbd7",
                "#fecdb7",
                "#eebcd1",
                "#fcc1c6",
                "#a1b6db",
            ]
    }, [darkMode])
    return palette
}
