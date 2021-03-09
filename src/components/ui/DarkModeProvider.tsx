import { PaletteType } from "@material-ui/core";
import React, { ReactNode, useEffect, useState } from "react";
import DarkModeContext from './DarkModeContext'

export default function DarkModeProvider(props: { children: ReactNode }) {
  const { children } = props;
  const KEY = 'darkMode'
  const [darkMode, setDarkMode] = useState<PaletteType>("light");
  const [darkModeMounted, setMounted] = useState(false);

  const setMode = (mode: PaletteType) => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(KEY, mode)
    setDarkMode(mode)
  }
  const toggleDarkMode = (mode?: PaletteType) => {
    mode = mode || (darkMode === 'light' ? 'dark' : 'light')
    if (mode === 'dark') {
      setMode('dark')
    } else {
      setMode('light')
    }
  };

  useEffect(() => {
    const localTheme = typeof window !== "undefined" && window.localStorage.getItem(KEY) as PaletteType;
    if (localTheme) {
      setDarkMode(localTheme || 'light');
    } else if (typeof window !== "undefined" && window?.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode('dark')
    } else {
      setDarkMode('light')
    }
    setMounted(true);
  }, []);

  return <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, darkModeMounted }}>
    {children}
  </DarkModeContext.Provider>
}
