import {
    CssBaseline,
    Theme,
    ThemeProvider,
    StyledEngineProvider,
} from "@mui/material"
import { SnackbarProvider } from "notistack"
import React, { ReactNode } from "react"
import JacdacProvider from "../../jacdac/Provider"
import { AppProvider } from "../AppContext"
import { DbProvider } from "../DbContext"
import { PacketsProvider } from "../PacketsContext"
import { ServiceManagerProvider } from "../ServiceManagerContext"
import { MakeCodeSnippetProvider } from "../makecode/MakeCodeSnippetContext"
import { WebAudioProvider } from "./WebAudioContext"
import { FileSystemProvider } from "../FileSystemContext"
import { AppInsightsErrorBoundary } from "../hooks/useAnalytics"
import { HostedSimulatorsProvider } from "../HostedSimulatorsContext"
import { ConsoleProvider } from "../console/ConsoleContext"
import { SimulatorDialogsProvider } from "../SimulatorsDialogContext"
import { CommandPaletteProvider } from "../commands/CommandPaletteContext"
import { YouTubeProvider } from "../youtube/YouTubeContext"
import { BrainManagerProvider } from "../brains/BrainManagerContext"
import { JacscriptProvider } from "../jacscript/JacscriptContext"

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
                        <DbProvider>
                            <FileSystemProvider>
                                <WebAudioProvider>
                                    <JacdacProvider>
                                        <HostedSimulatorsProvider>
                                            <ServiceManagerProvider>
                                                <PacketsProvider>
                                                    <AppProvider>
                                                        <JacscriptProvider>
                                                            <YouTubeProvider>
                                                                <CommandPaletteProvider>
                                                                    <SimulatorDialogsProvider>
                                                                        <ConsoleProvider>
                                                                            <MakeCodeSnippetProvider>
                                                                                <BrainManagerProvider>
                                                                                    <CssBaseline />

                                                                                    {
                                                                                        children
                                                                                    }
                                                                                </BrainManagerProvider>
                                                                            </MakeCodeSnippetProvider>
                                                                        </ConsoleProvider>
                                                                    </SimulatorDialogsProvider>
                                                                </CommandPaletteProvider>
                                                            </YouTubeProvider>
                                                        </JacscriptProvider>
                                                    </AppProvider>
                                                </PacketsProvider>
                                            </ServiceManagerProvider>
                                        </HostedSimulatorsProvider>
                                    </JacdacProvider>
                                </WebAudioProvider>
                            </FileSystemProvider>
                        </DbProvider>
                    </SnackbarProvider>
                </AppInsightsErrorBoundary>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}
