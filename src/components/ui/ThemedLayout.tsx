import {
    CssBaseline,
    Theme,
    ThemeProvider,
    StyledEngineProvider,
} from "@mui/material"
import { SnackbarProvider } from "notistack"
import React, { ReactNode } from "react"
import { FileSystemProvider } from "../FileSystemContext"
import { AppInsightsErrorBoundary } from "../hooks/useAnalytics"

/*
declare module "@mui/styles/defaultTheme" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {}
}
*/

export default function ThemedLayout(props: {
    theme: Theme
    maxSnack?: number
    children: ReactNode
}) {
    const { theme, maxSnack, children } = props
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <AppInsightsErrorBoundary>
                    <SnackbarProvider maxSnack={maxSnack || 1} dense={true}>
                        <FileSystemProvider>
                            <CssBaseline />

                            {children}
                        </FileSystemProvider>
                    </SnackbarProvider>
                </AppInsightsErrorBoundary>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}
