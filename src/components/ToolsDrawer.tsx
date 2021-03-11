import React, { useContext } from "react"
import {
    Drawer,
    makeStyles,
    createStyles,
    List,
    ListItemIcon,
    ListItemText,
    ListItem,
    Divider,
} from "@material-ui/core"
import { IconButton, Link } from "gatsby-theme-material-ui"
import {
    MOBILE_BREAKPOINT,
    MOBILE_TOOLS_DRAWER_WIDTH,
    TOOLS_DRAWER_WIDTH,
} from "./layout"
import AppContext from "./AppContext"
import { OpenInNew } from "@material-ui/icons"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SettingsBrightnessIcon from "@material-ui/icons/SettingsBrightness"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt"
import DarkModeContext from "./ui/DarkModeContext"
import KindIcon from "./KindIcon"
import MakeCodeIcon from "./icons/MakeCodeIcon"
import JupyterIcon from "./icons/JupyterIcon"
import {
    DEVICE_NODE_NAME,
    SERVICE_NODE_NAME,
    VIRTUAL_DEVICE_NODE_NAME,
    SERVICE_TEST_NODE_NAME,
} from "../../jacdac-ts/src/jdom/constants"

const useStyles = makeStyles(theme =>
    createStyles({
        drawer: {
            width: `${TOOLS_DRAWER_WIDTH}rem`,
            flexShrink: 0,
            [theme.breakpoints.down(MOBILE_BREAKPOINT)]: {
                width: `${MOBILE_TOOLS_DRAWER_WIDTH}rem`,
            },
        },
        drawerPaper: {
            width: `${TOOLS_DRAWER_WIDTH}rem`,
            [theme.breakpoints.down(MOBILE_BREAKPOINT)]: {
                width: `${MOBILE_TOOLS_DRAWER_WIDTH}rem`,
            },
        },
        drawerHeader: {
            display: "flex",
            alignItems: "center",
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: "flex-start",
        },
    })
)

function ToolsListItem(props: {
    text?: string
    url?: string
    icon?: JSX.Element
    onClick?: () => void,
    onClose: () => void
}) {
    const { text, url, icon, onClick, onClose } = props

    return url ? (
        <Link to={url} aria-label="Toggle Dark Mode" onClick={onClose}>
            <ListItem button={true}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText
                    primaryTypographyProps={{ color: "textPrimary" }}
                    primary={
                        <>
                            <span>{text}</span>
                            {/^https:\/\//.test(url) && (
                                <OpenInNew fontSize="small" color="action" />
                            )}
                        </>
                    }
                />
            </ListItem>
        </Link>
    ) : (
        <ListItem button={true} onClick={onClick} aria-label={text}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText
                primaryTypographyProps={{ color: "textPrimary" }}
                primary={text}
            />
        </ListItem>
    )
}

export default function ToolsDrawer() {
    const classes = useStyles()
    const { toolsMenu, setToolsMenu, toggleShowDeviceHostsDialog } = useContext(
        AppContext
    )
    const { toggleDarkMode, darkMode } = useContext(DarkModeContext)
    const handleClick = link => () => {
        setToolsMenu(false)
        link?.action()
    }
    const handleDrawerClose = () => {
        setToolsMenu(false)
    }
    const handleDarkMode = () => {
        setToolsMenu(false)
        toggleDarkMode()
    }
    const links = [
        {
            text: "Role Manager",
            url: "/tools/role-manager",
            icon: <EmojiObjectsIcon />,
        },
        {
            text: "Firmware Update",
            url: "/tools/updater",
            icon: <SystemUpdateAltIcon />,
        },
        {
            // separator
        },
        {
            text: "Start simulator",
            action: toggleShowDeviceHostsDialog,
            icon: <KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />,
        },
        {
            // separator
        },
        {
            text: "MakeCode",
            url: "/tools/makecode",
            icon: <MakeCodeIcon />,
        },
        {
            text: "Jupyter Lab",
            url: "/tools/jupyterlab",
            icon: <JupyterIcon />,
        },
        /*
            {
                text: "Edge Impulse",
                url: "/tools/edge-impulse",
                icon: <EdgeImpulseIcon />
            },
            {
            text: "Azure IoT Hub",
                    url: "/tools/azure-iot-hub",
                    icon: <CloudIcon />
            },
        */
        {
            // separator
        },
        {
            text: "Service Editor",
            url: "/tools/service-editor",
            icon: <KindIcon kind={SERVICE_NODE_NAME} />,
        },
        {
            text: "Service Test Editor",
            url: "/tools/service-test-editor",
            icon: <KindIcon kind={SERVICE_TEST_NODE_NAME} />,
        },
        {
            text: "Device registration",
            url: "/tools/device-registration",
            icon: <KindIcon kind={DEVICE_NODE_NAME} />,
        },
    ]

    if (!toolsMenu) return null

    return (
        <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="right"
            open={toolsMenu}
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <div className={classes.drawerHeader}>
                <IconButton aria-label="Collapse" onClick={handleDrawerClose}>
                    <ChevronRightIcon />
                </IconButton>
            </div>
            <List>
                {links.map((link, i) =>
                    link.text ? (
                        <ToolsListItem
                            key={link.text}
                            {...link}
                            onClick={handleClick(link)}
                            onClose={handleDrawerClose}
                        />
                    ) : (
                        <Divider key={`div${i}`} />
                    )
                )}
                <Divider />
                <ListItem
                    button={true}
                    onClick={handleDarkMode}
                    aria-label="Toggle Dark Mode"
                >
                    <ListItemIcon>
                        <SettingsBrightnessIcon />
                    </ListItemIcon>
                    <ListItemText>
                        {darkMode === "light" ? "Dark Mode" : "Light mode"}
                    </ListItemText>
                </ListItem>
            </List>
        </Drawer>
    )
}
