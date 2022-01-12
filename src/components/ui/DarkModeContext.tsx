import { createContext, CSSProperties } from "react"

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
    imgStyle: undefined
})
DarkModeContext.displayName = "DarkMode"

export default DarkModeContext
