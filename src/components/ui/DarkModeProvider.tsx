import { PaletteType, useMediaQuery } from "@material-ui/core"
import React, { ReactNode, useEffect, useState } from "react"
import DarkModeContext from "./DarkModeContext"

export default function DarkModeProvider(props: {
    fixedDarkMode?: PaletteType
    temporary?: boolean
    children: ReactNode
}) {
    const { fixedDarkMode, children } = props
    const KEY = "darkMode"
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
        noSsr: true,
    })
    const localTheme = () =>
        !fixedDarkMode &&
        typeof window !== "undefined" &&
        (window.localStorage.getItem(KEY) as PaletteType)

    const [darkMode, setDarkMode] = useState<PaletteType>(
        fixedDarkMode || localTheme() || (prefersDarkMode ? "dark" : "light")
    )
    const [darkModeMounted, setMounted] = useState(false)

    const setMode = (mode: PaletteType) => {
        if (mode === darkMode) return // nothing to do

        console.debug(`dark mode: set ${mode}`)
        if (!fixedDarkMode && typeof window !== "undefined")
            window.localStorage.setItem(KEY, mode)
        setDarkMode(mode)
    }
    const toggleDarkMode = (mode?: PaletteType) => {
        mode = mode || (darkMode === "light" ? "dark" : "light")
        if (mode === "dark") {
            setMode("dark")
        } else {
            setMode("light")
        }
    }

    useEffect(() => {
        console.debug(`dark mode`, { fixedDarkMode, prefersDarkMode, darkMode })
        setMounted(true)
    }, [])

    return (
        <DarkModeContext.Provider
            value={{ darkMode, toggleDarkMode, darkModeMounted }}
        >
            {children}
        </DarkModeContext.Provider>
    )
}
