import { useMediaQuery } from "@mui/material"
import React, {
    CSSProperties,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
    createContext,
} from "react"
import { useLocationSearchParamBoolean } from "../hooks/useLocationSearchParam"

export type PaletteType = "dark" | "light"

export interface DarkModeContextProps {
    darkMode: PaletteType
    toggleDarkMode: (mode?: PaletteType) => void
    darkModeMounted: boolean
    imgStyle?: CSSProperties
}

const DarkModeContext = createContext<DarkModeContextProps>({
    darkMode: "dark",
    toggleDarkMode: () => {},
    darkModeMounted: false,
    imgStyle: undefined,
})
DarkModeContext.displayName = "DarkMode"

export default DarkModeContext

export function DarkModeProvider(props: {
    fixedDarkMode?: PaletteType
    temporary?: boolean
    children: ReactNode
}) {
    const { fixedDarkMode, children } = props
    const KEY = "darkMode"
    const queryDarkMode = useLocationSearchParamBoolean("dark", false)
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
        noSsr: true,
    })
    const localTheme = () =>
        typeof window !== "undefined" &&
        (window.localStorage.getItem(KEY) as PaletteType)
    const [darkMode, setDarkMode] = useState<PaletteType>(
        queryDarkMode || fixedDarkMode
            ? "dark"
            : localTheme() || (prefersDarkMode ? "dark" : "light")
    )
    const [darkModeMounted, setMounted] = useState(false)

    const setMode = (mode: PaletteType) => {
        if (mode === darkMode || fixedDarkMode || queryDarkMode) return // nothing to do

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
