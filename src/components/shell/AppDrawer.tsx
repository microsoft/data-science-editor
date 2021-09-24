import React, { lazy, useContext } from "react"
import { Drawer, Divider, makeStyles, createStyles } from "@material-ui/core"
import Suspense from "../ui/Suspense"
import { IconButton } from "gatsby-theme-material-ui"
// tslint:disable-next-line: no-submodule-imports
import { DRAWER_WIDTH, MOBILE_BREAKPOINT, TOC_DRAWER_WIDTH } from "../layout"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import AppContext, { DrawerType } from "../AppContext"
import PacketRecorder from "../PacketRecorder"
import DrawerToolsButtonGroup from "../DrawerToolsButtonGroup"
import ConnectAlert from "../alert/ConnectAlert"

const Toc = lazy(() => import("../Toc"))
const PacketView = lazy(() => import("../tools/PacketView"))
const JDomTreeView = lazy(() => import("../tools/JDomTreeView"))
const DrawerSearchResults = lazy(() => import("../DrawerSearchResults"))
const DrawerSearchInput = lazy(() => import("../DrawerSearchInput"))

const useStyles = makeStyles(theme =>
    createStyles({
        drawer: {
            width: `${DRAWER_WIDTH}rem`,
            flexShrink: 0,
            [theme.breakpoints.down(MOBILE_BREAKPOINT)]: {
                width: `100%`,
            },
        },
        drawerPaper: {
            width: `${DRAWER_WIDTH}rem`,
            [theme.breakpoints.down(MOBILE_BREAKPOINT)]: {
                width: `100%`,
            },
        },
        tocDrawer: {
            width: `${TOC_DRAWER_WIDTH}rem`,
            flexShrink: 0,
        },
        tocDrawerPaper: {
            width: `${TOC_DRAWER_WIDTH}rem`,
        },
        drawerHeader: {
            display: "flex",
            alignItems: "center",
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: "flex-start",
        },
        alertButton: {
            marginLeft: theme.spacing(2),
        },
        mdx: {
            margin: theme.spacing(2),
        },
        fluid: {
            flex: 1,
        },
    })
)

export default function AppDrawer(props: { pagePath: string }) {
    const { pagePath } = props
    const classes = useStyles()
    const { drawerType, setDrawerType, searchQuery } = useContext(AppContext)
    const open = drawerType !== DrawerType.None
    const showSearchResults = drawerType === DrawerType.Toc && !!searchQuery

    const handleDrawerClose = () => {
        setDrawerType(DrawerType.None)
    }

    if (drawerType === DrawerType.None) return <></>

    const toc = drawerType === DrawerType.Toc
    return (
        <Drawer
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
                        <DrawerToolsButtonGroup
                            showPackets={true}
                            showConnect={true}
                        />
                    </>
                )}
                <IconButton aria-label="Collapse" onClick={handleDrawerClose}>
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
            {!showSearchResults && drawerType === DrawerType.Packets ? (
                <Suspense>
                    <PacketView showTime={true} />
                </Suspense>
            ) : drawerType === DrawerType.Dom ? (
                <>
                    <ConnectAlert closeable={true} />
                    <Suspense>
                        <JDomTreeView />
                    </Suspense>
                </>
            ) : undefined}
        </Drawer>
    )
}
