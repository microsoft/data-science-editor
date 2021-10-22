import React, { lazy, useContext } from "react"
import clsx from "clsx"
import { makeStyles, Container } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import "./layout.css"
import SEO from "./shell/SEO"
import {
    createTheme,
    responsiveFontSizes,
    createStyles,
    ThemeOptions,
} from "@material-ui/core/styles"
import AppContext, { DrawerType } from "./AppContext"
import DarkModeProvider from "./ui/DarkModeProvider"
import DarkModeContext from "./ui/DarkModeContext"
import Alert from "./ui/Alert"
import Footer from "./shell/Footer"
import Flags from "../../jacdac-ts/src/jdom/flags"
import { WindowLocation } from "@reach/router"
import Suspense from "./ui/Suspense"
import ThemedMdxLayout from "./ui/ThemedMdxLayout"
import Breadcrumbs from "./ui/Breadcrumbs"
import useMediaQueries from "./hooks/useMediaQueries"
import MainAppBar from "./shell/MainAppBar"
import DataEditorAppBar from "./shell/DataEditorAppBar"
import { AlertTitle } from "@material-ui/lab"
import { UIFlags } from "../jacdac/providerbus"

const TraceAlert = lazy(() => import("./shell/TraceAlert"))
const WebDiagnostics = lazy(() => import("./shell/WebDiagnostics"))
const AppDrawer = lazy(() => import("./shell/AppDrawer"))
const ToolsDrawer = lazy(() => import("./shell/ToolsDrawer"))
const WebCam = lazy(() => import("./ui/WebCam"))

export const TOC_DRAWER_WIDTH = 18
export const DRAWER_WIDTH = 40
export const TOOLS_DRAWER_WIDTH = 22
export const MOBILE_DRAWER_WIDTH = 20
export const MOBILE_TOOLS_DRAWER_WIDTH = 18
export const MOBILE_BREAKPOINT = "sm"
export const MEDIUM_BREAKPOINT = "md"

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            display: "flex",
            flexGrow: 1,
        },
        hideMobile: {
            [theme.breakpoints.down("md")]: {
                display: "none",
            },
        },
        drawerHeader: {
            display: "flex",
            alignItems: "center",
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: "flex-end",
        },
        content: {
            display: "flex",
            minHeight: "100vh",
            minWidth: "10rem",
            flexDirection: "column",
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            flexGrow: 1,
            padding: theme.spacing(0.5),
        },
        contentPadding: {
            padding: theme.spacing(3),
        },
        container: {
            padding: theme.spacing(3),
        },
        mainContent: {
            flexGrow: 1,
        },
        contentShift: {
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        toolsContentShift: {
            width: `calc(100% - 0.5rem)`,
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: `-${TOOLS_DRAWER_WIDTH}rem`,
            [theme.breakpoints.down(MOBILE_BREAKPOINT)]: {
                marginLeft: `-${MOBILE_TOOLS_DRAWER_WIDTH}rem`,
            },
        },
    })
)

export interface LayoutProps {
    element?: JSX.Element
    props: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pageContext?: any
        path?: string
        uri?: string
        location?: WindowLocation
    }
}

export default function Layout(props: LayoutProps) {
    return (
        <DarkModeProvider>
            <LayoutWithDarkMode {...props} />
        </DarkModeProvider>
    )
}

function LayoutWithDarkMode(props: LayoutProps) {
    const { element, props: pageProps } = props
    const { pageContext, path } = pageProps
    const { frontmatter } = pageContext || {}
    const makeCodeTool = /tools\/makecode-/.test(path)
    const { fullScreen } = frontmatter || {
        fullScreen: makeCodeTool,
    }
    const { darkModeMounted } = useContext(DarkModeContext)

    if (!darkModeMounted) return <div />
    else if (fullScreen) return element
    else return <LayoutWithMdx {...props} />
}

function LayoutWithMdx(props: LayoutProps) {
    const { darkMode } = useContext(DarkModeContext)
    const isDark = darkMode === "dark"
    const themeDef: ThemeOptions = {
        palette: {
            primary: {
                main: isDark ? "#56d364" : "#2e7d32",
            },
            secondary: {
                main: "#ffc400",
            },
            contrastThreshold: isDark ? 5.1 : 3.1,
            type: darkMode,
        },
    }
    const rawTheme = createTheme(themeDef)
    const theme = responsiveFontSizes(rawTheme)

    return (
        <ThemedMdxLayout theme={theme}>
            <LayoutWithContext {...props} />
        </ThemedMdxLayout>
    )
}

const UNDER_CONSTRUCTION_BODY = `Jacdac is currently in preview. If you would like to join as a pre-release test partner, please email jacdac-tap@microsoft.com.`

function LayoutWithContext(props: LayoutProps) {
    const { element, props: pageProps } = props
    const { pageContext, path, location } = pageProps
    const { frontmatter } = pageContext || {}

    const isHosted = UIFlags.hosted
    const tools = /^\/tools\//.test(path)
    const makeCodeTool = /tools\/makecode-/.test(path)
    const fullWidthTools =
        /^\/editors\/\w+\/$/.test(path) ||
        /^\/(tools\/makecode-|dashboard)/.test(path)
    const isDataEditor = /^\/editors\/data/.test(path)
    const {
        hideMainMenu = false,
        hideUnderConstruction = false,
        hideBreadcrumbs = false,
    } = frontmatter || {
        hideMainMenu: isHosted || makeCodeTool,
        hideUnderConstruction: isDataEditor || makeCodeTool || fullWidthTools,
        hideBreadcrumbs: isDataEditor || tools || fullWidthTools,
    }

    const appBar = hideMainMenu ? undefined : isDataEditor ? (
        <DataEditorAppBar />
    ) : (
        <MainAppBar />
    )
    const title = isDataEditor
        ? "Data Science Editor (Experimental)"
        : pageContext?.title || frontmatter?.title || undefined
    const classes = useStyles()

    const { darkMode } = useContext(DarkModeContext)
    const { drawerType, toolsMenu, showWebCam } = useContext(AppContext)
    const drawerOpen = drawerType !== DrawerType.None
    const { medium } = useMediaQueries()
    const container = !medium && !fullWidthTools
    // && path !== "/"
    const mainClasses = clsx(classes.content, {
        [classes.container]: container,
        [classes.contentPadding]: !fullWidthTools,
        [classes.contentShift]: drawerOpen,
        [classes.toolsContentShift]: toolsMenu,
    })

    const InnerMainSection = () => (
        <>
            <Suspense>
                <TraceAlert />
            </Suspense>
            {!hideUnderConstruction && (
                <Alert closeable={true} severity="warning">
                    <AlertTitle>Partner Preview</AlertTitle>
                    {UNDER_CONSTRUCTION_BODY}
                </Alert>
            )}
            {Flags.diagnostics && (
                <Suspense>
                    <WebDiagnostics />
                </Suspense>
            )}
            {!hideBreadcrumbs && location && (
                <Breadcrumbs location={location} />
            )}
            {fullWidthTools ? (
                element
            ) : (
                <Typography className={"markdown"} component="span">
                    {element}
                </Typography>
            )}
        </>
    )

    const MainSection = () => (
        <>
            <main className={classes.mainContent}>
                {!hideMainMenu && <div className={classes.drawerHeader} />}
                {container ? (
                    <Container>
                        <InnerMainSection />
                    </Container>
                ) : (
                    <InnerMainSection />
                )}
            </main>
            <Footer />
        </>
    )

    return (
        <div className={clsx(darkMode, classes.root)}>
            <header>
                <SEO lang="en" title={title} />
            </header>
            {!hideMainMenu && (
                <nav>
                    {appBar}
                    {drawerType !== DrawerType.None && (
                        <Suspense>
                            <AppDrawer pagePath={path} />
                        </Suspense>
                    )}
                    {toolsMenu && (
                        <Suspense>
                            <ToolsDrawer />
                        </Suspense>
                    )}
                </nav>
            )}
            {container ? (
                <Container
                    maxWidth={"xl"}
                    disableGutters={true}
                    className={mainClasses}
                >
                    <MainSection />
                </Container>
            ) : (
                <div className={mainClasses}>
                    <MainSection />
                </div>
            )}
            {showWebCam && (
                <Suspense>
                    <WebCam />
                </Suspense>
            )}
        </div>
    )
}
