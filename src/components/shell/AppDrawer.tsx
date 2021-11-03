import React, { lazy, useContext } from "react"
import { styled } from "@mui/material/styles"
import { Drawer, Divider } from "@mui/material"
import Suspense from "../ui/Suspense"
import { IconButton } from "gatsby-theme-material-ui"
// tslint:disable-next-line: no-submodule-imports
import { DRAWER_WIDTH, MOBILE_BREAKPOINT, TOC_DRAWER_WIDTH } from "../layout"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import AppContext, { DrawerType } from "../AppContext"
import PacketRecorder from "../PacketRecorder"
import DrawerToolsButtonGroup from "./DrawerToolsButtonGroup"
import ConnectAlert from "../alert/ConnectAlert"

const PREFIX = "AppDrawer"

const classes = {
    drawer: `${PREFIX}-drawer`,
    drawerPaper: `${PREFIX}-drawerPaper`,
    tocDrawer: `${PREFIX}-tocDrawer`,
    tocDrawerPaper: `${PREFIX}-tocDrawerPaper`,
    drawerHeader: `${PREFIX}-drawerHeader`,
    alertButton: `${PREFIX}-alertButton`,
    mdx: `${PREFIX}-mdx`,
    fluid: `${PREFIX}-fluid`,
}

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    [`& .${classes.drawer}`]: {
        width: `${DRAWER_WIDTH}rem`,
        flexShrink: 0,
        [theme.breakpoints.down(MOBILE_BREAKPOINT)]: {
            width: `100%`,
        },
    },

    [`& .${classes.drawerPaper}`]: {
        width: `${DRAWER_WIDTH}rem`,
        [theme.breakpoints.down(MOBILE_BREAKPOINT)]: {
            width: `100%`,
        },
    },

    [`& .${classes.tocDrawer}`]: {
        width: `${TOC_DRAWER_WIDTH}rem`,
        flexShrink: 0,
    },

    [`& .${classes.tocDrawerPaper}`]: {
        width: `${TOC_DRAWER_WIDTH}rem`,
    },

    [`& .${classes.drawerHeader}`]: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: "flex-start",
    },

    [`& .${classes.alertButton}`]: {
        marginLeft: theme.spacing(2),
    },

    [`& .${classes.mdx}`]: {
        margin: theme.spacing(2),
    },

    [`& .${classes.fluid}`]: {
        flex: 1,
    },
}))

const Toc = lazy(() => import("../Toc"))
const PacketView = lazy(() => import("../tools/PacketView"))
const JDomTreeView = lazy(() => import("../tools/JDomTreeView"))
const DrawerSearchResults = lazy(() => import("../DrawerSearchResults"))
const DrawerSearchInput = lazy(() => import("../DrawerSearchInput"))
const Console = lazy(() => import("../console/Console"))

export default function AppDrawer(props: { pagePath: string }) {
    const { pagePath } = props

    const { drawerType, setDrawerType, searchQuery } = useContext(AppContext)
    const open = drawerType !== DrawerType.None
    const showSearchResults = drawerType === DrawerType.Toc && !!searchQuery

    const handleDrawerClose = () => {
        setDrawerType(DrawerType.None)
    }

    if (drawerType === DrawerType.None) return null

    const toc = drawerType === DrawerType.Toc
    return (
        <StyledDrawer
            className={toc ? classes.tocDrawer : classes.drawer}
            variant="persistent"
            anchor="left"
            open={open}
            classes={{
                paper: toc ? classes.tocDrawerPaper : classes.drawerPaper,
            }}
        >
            <div className={classes.drawerHeader}>
                {toc && (
                    <div className={classes.fluid}>
                        <Suspense>
                            <DrawerSearchInput />
                        </Suspense>
                    </div>
                )}
                {!toc && (
                    <>
                        <PacketRecorder />
                        <span className={classes.fluid} />
                        <DrawerToolsButtonGroup />
                    </>
                )}
                <IconButton
                    aria-label="Collapse"
                    onClick={handleDrawerClose}
                    size="large"
                >
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <Divider />
            {showSearchResults && (
                <Suspense>
                    <DrawerSearchResults />
                </Suspense>
            )}
            {!showSearchResults && drawerType === DrawerType.Toc && (
                <Suspense>
                    <Toc pagePath={pagePath} />
                </Suspense>
            )}
            {!showSearchResults && drawerType === DrawerType.Packets && (
                <Suspense>
                    <PacketView showTime={true} />
                </Suspense>
            )}
            {!showSearchResults && drawerType === DrawerType.Dom && (
                <>
                    <ConnectAlert closeable={true} />
                    <Suspense>
                        <JDomTreeView />
                    </Suspense>
                </>
            )}
            {!showSearchResults && drawerType === DrawerType.Console && (
                <Suspense>
                    <Console />
                </Suspense>
            )}
        </StyledDrawer>
    )
}
