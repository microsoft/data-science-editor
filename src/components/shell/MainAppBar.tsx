import React, { useContext } from "react"
import { styled } from "@mui/material/styles"
import clsx from "clsx"
import { Hidden, Box } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import MoreIcon from "@mui/icons-material/MoreVert"
// tslint:disable-next-line: no-submodule-imports
import AppContext, { DrawerType } from "../AppContext"
import DarkModeContext from "../ui/DarkModeContext"
import GitHubButton from "../buttons/GitHubButton"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import OpenDashboardButton from "../buttons/OpenDashboardButton"
import PacketStats from "./PacketStats"
import { Link } from "gatsby-theme-material-ui"
import ForumIcon from "@mui/icons-material/Forum"
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
import DrawerToolsButton from "./DrawerToolsButton"

const PREFIX = "MainAppBar"

const classes = {
    grow: `${PREFIX}-grow`,
    appBar: `${PREFIX}-appBar`,
    appBarShift: `${PREFIX}-appBarShift`,
    tocBarShift: `${PREFIX}-tocBarShift`,
    toolBarShift: `${PREFIX}-toolBarShift`,
    menuButton: `${PREFIX}-menuButton`,
    hideMobile: `${PREFIX}-hideMobile`,
}

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.grow}`]: {
        flexGrow: 1,
    },

    [`& .${classes.appBar}`]: {
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },

    [`& .${classes.appBarShift}`]: {
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

    [`& .${classes.tocBarShift}`]: {
        width: `calc(100% - ${TOC_DRAWER_WIDTH}rem)`,
        marginLeft: `${TOC_DRAWER_WIDTH}rem`,
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },

    [`& .${classes.toolBarShift}`]: {
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

    [`& .${classes.menuButton}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.hideMobile}`]: {
        [theme.breakpoints.down("lg")]: {
            display: "none",
        },
    },
}))

function MainToolbar() {
    const { drawerType, toolsMenu, setToolsMenu } = useContext(AppContext)
    const drawerOpen = drawerType !== DrawerType.None
    const toggleToolsMenu = () => setToolsMenu(!toolsMenu)

    return (
        <Toolbar>
            {drawerType === DrawerType.None && (
                <DrawerToolsButton
                    className={clsx(
                        classes.menuButton,
                        drawerOpen && classes.hideMobile
                    )}
                />
            )}
            <Hidden implementation="css" smDown={true}>
                <Typography component="h1" variant="h6">
                    <Link
                        style={{
                            color: UIFlags.widget ? "black" : "white",
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
            <OpenDashboardButton className={clsx(classes.menuButton)} />
            {false && (
                <OpenVMEditorButton className={clsx(classes.menuButton)} />
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
    )
}

export default function MainAppBar() {
    const { drawerType, toolsMenu } = useContext(AppContext)
    const { darkMode } = useContext(DarkModeContext)
    const drawerOpen = drawerType !== DrawerType.None
    const appBarColor =
        darkMode === "dark" ? "inherit" : UIFlags.widget ? "default" : undefined
    return (
        <Root>
            <Box displayPrint="none">
                <HideOnScroll>
                    <AppBar
                        position="fixed"
                        color={appBarColor}
                        className={clsx(classes.appBar, {
                            [classes.tocBarShift]:
                                drawerType === DrawerType.Toc,
                            [classes.appBarShift]:
                                drawerOpen && drawerType !== DrawerType.Toc,
                            [classes.toolBarShift]: toolsMenu,
                        })}
                    >
                        <MainToolbar />
                    </AppBar>
                </HideOnScroll>
            </Box>
        </Root>
    )
}
