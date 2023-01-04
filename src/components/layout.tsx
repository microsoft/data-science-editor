import React, { useContext } from "react"
import { styled } from "@mui/material/styles"
import clsx from "clsx"
import { Container } from "@mui/material"
import Typography from "@mui/material/Typography"
import "./layout.css"
import {
    createTheme,
    responsiveFontSizes,
    DeprecatedThemeOptions,
} from "@mui/material/styles"
import DarkModeContext, { DarkModeProvider } from "./ui/DarkModeContext"
import Footer from "./shell/Footer"
import { WindowLocation } from "@reach/router"
import ThemedMdxLayout from "./ui/ThemedMdxLayout"
import DataEditorAppBar from "./shell/DataEditorAppBar"

const PREFIX = "Layout"

const classes = {
    root: `${PREFIX}Root`,
    hideMobile: `${PREFIX}HideMobile`,
    drawerHeader: `${PREFIX}DrawerHeader`,
    content: `${PREFIX}Content`,
    contentPadding: `${PREFIX}ContentPadding`,
    container: `${PREFIX}Container`,
    mainContent: `${PREFIX}MainContent`,
}

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.root}`]: {
        display: "flex",
        flexGrow: 1,
    },

    [`& .${classes.hideMobile}`]: {
        [theme.breakpoints.down("lg")]: {
            display: "none",
        },
    },

    [`& .${classes.drawerHeader}`]: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: "flex-end",
    },

    [`& .${classes.content}`]: {
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

    [`& .${classes.contentPadding}`]: {
        padding: theme.spacing(3),
    },

    [`& .${classes.container}`]: {
        padding: theme.spacing(3),
    },

    [`& .${classes.mainContent}`]: {
        flexGrow: 1,
    },
}))

export const TOC_DRAWER_WIDTH = 18
export const DRAWER_WIDTH = 42
export const TOOLS_DRAWER_WIDTH = 22
export const MOBILE_DRAWER_WIDTH = 20
export const MOBILE_TOOLS_DRAWER_WIDTH = 18
export const MOBILE_BREAKPOINT = "sm"
export const MEDIUM_BREAKPOINT = "md"

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
    const themeDef: DeprecatedThemeOptions = {
        palette: {
            primary: {
                main: isDark ? "#56d364" : "#2e7d32",
            },
            secondary: {
                main: "#ffc400",
            },
            contrastThreshold: isDark ? 5.1 : 3.1,
            mode: darkMode,
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

function LayoutWithContext(props: LayoutProps) {
    const { element, props: pageProps } = props
    const { path } = pageProps

    const appBar = <DataEditorAppBar />

    const { darkMode } = useContext(DarkModeContext)
    const container = path !== "/"
    // && path !== "/"
    const mainClasses = clsx(classes.content, {
        [classes.container]: container,
        [classes.contentPadding]: false,
    })

    const InnerMainSection = () => element
    const MainSection = () => (
        <>
            <main className={classes.mainContent}>
                <div className={classes.drawerHeader} />
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
        <Root>
            <div className={clsx(darkMode, classes.root)}>
                <nav>{appBar}</nav>
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
            </div>
        </Root>
    )
}
