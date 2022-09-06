import { useMediaQuery } from "@mui/material"
import React, {
    CSSProperties,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"
import DarkModeContext, { PaletteType } from "./DarkModeContext"

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
        if (mode === darkMode || fixedDarkMode) return // nothing to do

        if (typeof window !== "undefined")
            window.localStorage.setItem(KEY, mode)
        setDarkMode(mode)
    }
    const toggleDarkMode = useCallback(
        (mode?: PaletteType) => {
            mode = mode || (darkMode === "light" ? "dark" : "light")
            if (mode === "dark") {
                setMode("dark")
            } else {
                setMode("light")
            }
        },
        [darkMode]
    )
    const imgStyle = useMemo<CSSProperties>(
        () =>
            darkMode == "dark"
                ? ({
                      filter: "drop-shadow(0 0 0.5rem #444)",
                  } as CSSProperties)
                : undefined,
        [darkMode]
    )

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <DarkModeContext.Provider
            value={{ darkMode, toggleDarkMode, darkModeMounted, imgStyle }}
        >
            {children}
        </DarkModeContext.Provider>
    )
}
