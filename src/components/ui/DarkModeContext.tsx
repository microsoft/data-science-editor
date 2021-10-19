import { PaletteType } from "@material-ui/core";
import { createContext } from "react";

export interface DarkModeContextProps {
  darkMode: PaletteType,
  toggleDarkMode: (mode?: PaletteType) => void,
  darkModeMounted: boolean
}

const DarkModeContext = createContext<DarkModeContextProps>({
  darkMode: 'dark',
  toggleDarkMode: () => { },
  darkModeMounted: false,
});
DarkModeContext.displayName = "DarkMode";

export default DarkModeContext;