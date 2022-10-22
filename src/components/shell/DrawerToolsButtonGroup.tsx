import React, { useContext } from "react"
import AppContext, { DrawerType } from "../AppContext"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import HistoryIcon from "@mui/icons-material/History"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft"
import JacdacIcon from "../icons/JacdacIcon"

export default function DrawerToolsButtonGroup(props: { className?: string }) {
    const { className } = props
    const { drawerType, setDrawerType } = useContext(AppContext)

    const handleDrawer = (drawer: DrawerType) => () => setDrawerType(drawer)
    const drawers = [
        {
            drawer: DrawerType.Dom,
            label: "open device tree",
            icon: <AccountTreeIcon />,
        },
        {
            drawer: DrawerType.Dashboard,
            label: "open dashboard",
            icon: <JacdacIcon />,
        },
        {
            drawer: DrawerType.Console,
            label: "open console",
            icon: <FormatAlignLeftIcon />,
        },
        {
            drawer: DrawerType.Packets,
            label: "open packet trace",
            icon: <HistoryIcon />,
        },
    ]
    return (
        <>
            {drawers.map(drawer => (
                <IconButtonWithTooltip
                    key={drawer.label}
                    title={drawer.label}
                    className={className}
                    trackName={`menu.drawer.${drawer.drawer}`}
                    trackProperties={{ drawer: drawer.drawer }}
                    color={drawerType === drawer.drawer ? "primary" : "inherit"}
                    onClick={handleDrawer(drawer.drawer)}
                    edge="start"
                >
                    {drawer.icon}
                </IconButtonWithTooltip>
            ))}
        </>
    )
}
