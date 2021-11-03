import {
    CssBaseline,
    Theme,
    ThemeProvider,
    StyledEngineProvider,
} from "@mui/material"
import { SnackbarProvider } from "notistack"
import React, { ReactNode } from "react"
import { IdProvider } from "react-use-id-hook"
import { LiveAnnouncer } from "react-aria-live"
import JacdacProvider from "../../jacdac/Provider"
import { AppProvider } from "../AppContext"
import { DbProvider } from "../DbContext"
import { PacketsProvider } from "../PacketsContext"
import { ServiceManagerProvider } from "../ServiceManagerContext"
import Helmet from "react-helmet"
import { MakeCodeSnippetProvider } from "../makecode/MakeCodeSnippetContext"
import { WebAudioProvider } from "./WebAudioContext"
import { FileSystemProvider } from "../FileSystemContext"
import { AppInsightsErrorBoundary } from "../hooks/useAnalytics"
import { HostedSimulatorsProvider } from "../HostedSimulatorsContext"
import { ConsoleProvider } from "../console/ConsoleContext"

declare module "@mui/styles/defaultTheme" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {}
}

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
                        <IdProvider>
                            <LiveAnnouncer>
                                <DbProvider>
                                    <FileSystemProvider>
                                        <WebAudioProvider>
                                            <JacdacProvider
                                                connectOnStart={true}
                                            >
                                                <HostedSimulatorsProvider>
                                                    <ServiceManagerProvider>
                                                        <PacketsProvider>
                                                            <AppProvider>
                                                                <ConsoleProvider>
                                                                    <MakeCodeSnippetProvider>
                                                                        <CssBaseline />
                                                                        <Helmet>
                                                                            <link
                                                                                rel="preconnect"
                                                                                href="https://fonts.googleapis.com"
                                                                                crossOrigin="anonymous"
                                                                            />
                                                                            <link
                                                                                rel="preconnect"
                                                                                href="https://raw.githubusercontent.com"
                                                                                crossOrigin="anonymous"
                                                                            />
                                                                            <meta
                                                                                name="viewport"
                                                                                content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
                                                                            />
                                                                        </Helmet>
                                                                        {
                                                                            children
                                                                        }
                                                                    </MakeCodeSnippetProvider>
                                                                </ConsoleProvider>
                                                            </AppProvider>
                                                        </PacketsProvider>
                                                    </ServiceManagerProvider>
                                                </HostedSimulatorsProvider>
                                            </JacdacProvider>
                                        </WebAudioProvider>
                                    </FileSystemProvider>
                                </DbProvider>
                            </LiveAnnouncer>
                        </IdProvider>
                    </SnackbarProvider>
                </AppInsightsErrorBoundary>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}
