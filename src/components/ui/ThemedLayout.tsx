import { CssBaseline, Theme, ThemeProvider } from "@material-ui/core"
import { SnackbarProvider } from "notistack"
import React, { ReactNode } from "react"
import { IdProvider } from "react-use-id-hook"
import JacdacProvider from "../../jacdac/Provider"
import { AppProvider } from "../AppContext"
import { DbProvider } from "../DbContext"
import { PacketsProvider } from "../PacketsContext"
import { ServiceManagerProvider } from "../ServiceManagerContext"
import Helmet from "react-helmet"
import { MakeCodeSnippetProvider } from "../makecode/MakeCodeSnippetContext"

export default function ThemedLayout(props: {
    theme: Theme
    maxSnack?: number
    children: ReactNode
}) {
    const { theme, maxSnack, children } = props
    return (
        <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={maxSnack || 1} dense={true}>
                <IdProvider>
                    <DbProvider>
                        <JacdacProvider>
                            <ServiceManagerProvider>
                                <PacketsProvider>
                                    <AppProvider>
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
                                            {children}
                                        </MakeCodeSnippetProvider>
                                    </AppProvider>
                                </PacketsProvider>
                            </ServiceManagerProvider>
                        </JacdacProvider>
                    </DbProvider>
                </IdProvider>
            </SnackbarProvider>
        </ThemeProvider>
    )
}
