import {
    createTheme,
    responsiveFontSizes,
    ThemeOptions,
    ThemeProvider,
} from "@material-ui/core"
import React, { useContext } from "react"
import DarkModeContext from "./DarkModeContext"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AppTheme(props: any) {
    const { darkMode } = useContext(DarkModeContext)
    const isDark = darkMode === "dark"
    const themeDef: ThemeOptions = {
        palette: {
            primary: {
                main: isDark ? "#56d364" : "#2e7d32",
            },
            secondary: {
                main: "#ffc400",
            },
            background: {
                default: isDark ? undefined : "#fff",
            },
            contrastThreshold: isDark ? 5.1 : 3.1,
            type: darkMode,
        },
    }
    const rawTheme = createTheme(themeDef)
    const theme = responsiveFontSizes(rawTheme)
    return <ThemeProvider theme={theme} {...props} />
}
