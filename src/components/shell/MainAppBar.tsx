import React, { useContext } from "react"
import clsx from "clsx"
import { Hidden, Box, makeStyles, createStyles } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import MoreIcon from "@material-ui/icons/MoreVert"
// tslint:disable-next-line: no-submodule-imports
import AppContext, { DrawerType } from "../AppContext"
import DarkModeContext from "../ui/DarkModeContext"
import GitHubButton from "../buttons/GitHubButton"
import DrawerToolsButtonGroup from "../DrawerToolsButtonGroup"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import OpenDashboardButton from "../buttons/OpenDashboardButton"
import PacketStats from "./PacketStats"
import { Link } from "gatsby-theme-material-ui"
import ForumIcon from "@material-ui/icons/Forum"
import { UIFlags } from "../../jacdac/providerbus"
import { HideOnScroll } from "../ui/HideOnScroll"
import OpenVMEditorButton from "../buttons/OpenVMEditorButton"
import {
    DRAWER_WIDTH,
    MOBILE_BREAKPOINT,
    MOBILE_DRAWER_WIDTH,
    TOC_DRAWER_WIDTH,
    TOOLS_DRAWER_WIDTH,
    MOBILE_TOOLS_DRAWER_WIDTH,
} from "../layout"
import BridgeButtons from "../ui/BridgeButtons"
import Flags from "../../../jacdac-ts/src/jdom/flags"

const useStyles = makeStyles(theme =>
    createStyles({
        grow: {
            flexGrow: 1,
        },
        appBar: {
            transition: theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        appBarShift: {
            width: `calc(100% - ${DRAWER_WIDTH}rem)`,
            marginLeft: `${DRAWER_WIDTH}rem`,
            [theme.breakpoints.down(MOBILE_BREAKPOINT)]: {
                width: `calc(100% - ${MOBILE_DRAWER_WIDTH}rem)`,
                marginLeft: `${MOBILE_DRAWER_WIDTH}rem`,
            },
            transition: theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        tocBarShift: {
            width: `calc(100% - ${TOC_DRAWER_WIDTH}rem)`,
            marginLeft: `${TOC_DRAWER_WIDTH}rem`,
            transition: theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        toolBarShift: {
            width: `calc(100% - ${TOOLS_DRAWER_WIDTH}rem)`,
            marginRight: `${TOOLS_DRAWER_WIDTH}rem`,
            [theme.breakpoints.down(MOBILE_BREAKPOINT)]: {
                width: `calc(100% - ${MOBILE_TOOLS_DRAWER_WIDTH}rem)`,
                marginRight: `${MOBILE_TOOLS_DRAWER_WIDTH}rem`,
            },
            transition: theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        menuButton: {
            marginRight: theme.spacing(1),
        },
        hideMobile: {
            [theme.breakpoints.down("md")]: {
                display: "none",
            },
        },
    })
)

export default function MainAppBar() {
    const classes = useStyles()
    const { drawerType, toolsMenu, setToolsMenu } = useContext(AppContext)
    const { darkMode } = useContext(DarkModeContext)
    const drawerOpen = drawerType !== DrawerType.None
    const appBarColor =
        darkMode === "dark" ? "inherit" : UIFlags.widget ? "default" : undefined

    const toggleToolsMenu = () => setToolsMenu(!toolsMenu)

    return (
        <Box displayPrint="none">
            <HideOnScroll>
                <AppBar
                    position="fixed"
                    color={appBarColor}
                    className={clsx(classes.appBar, {
                        [classes.tocBarShift]: drawerType === DrawerType.Toc,
                        [classes.appBarShift]:
                            drawerOpen && drawerType !== DrawerType.Toc,
                        [classes.toolBarShift]: toolsMenu,
                    })}
                >
                    <Toolbar>
                        <DrawerToolsButtonGroup
                            className={clsx(
                                classes.menuButton,
                                drawerOpen && classes.hideMobile
                            )}
                            showToc={true}
                            showCurrent={true}
                            showTrace={true}
                        />
                        <Hidden implementation="css" xsDown={true}>
                            <Typography component="h1" variant="h6">
                                <Link
                                    style={{
                                        color: UIFlags.widget
                                            ? "black"
                                            : "white",
                                    }}
                                    to="/"
                                >
                                    Jacdac
                                </Link>
                            </Typography>
                        </Hidden>
                        <div className={classes.grow} />
                        {Flags.diagnostics && <PacketStats />}
                        <BridgeButtons className={clsx(classes.menuButton)} />
                        <OpenDashboardButton
                            className={clsx(classes.menuButton)}
                        />
                        {false && (
                            <OpenVMEditorButton
                                className={clsx(classes.menuButton)}
                            />
                        )}
                        <IconButtonWithTooltip
                            className={clsx(
                                classes.menuButton,
                                drawerOpen && classes.hideMobile
                            )}
                            aria-label="Discussions"
                            title="Discussions"
                            edge="start"
                            color="inherit"
                            to="https://github.com/microsoft/jacdac/discussions"
                        >
                            <ForumIcon />
                        </IconButtonWithTooltip>
                        <GitHubButton
                            className={clsx(
                                classes.menuButton,
                                drawerOpen && classes.hideMobile
                            )}
                            repo={"/github"}
                        />
                        <IconButtonWithTooltip
                            className={clsx(
                                classes.menuButton,
                                drawerOpen && classes.hideMobile
                            )}
                            aria-label="More tools"
                            title="More"
                            edge="start"
                            color="inherit"
                            onClick={toggleToolsMenu}
                        >
                            <MoreIcon />
                        </IconButtonWithTooltip>
                    </Toolbar>
                </AppBar>
            </HideOnScroll>
        </Box>
    )
}
