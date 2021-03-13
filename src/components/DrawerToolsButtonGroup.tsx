import React, { useContext } from "react"
import AppContext, { DrawerType } from "./AppContext"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import HistoryIcon from "@material-ui/icons/History"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import MenuIcon from "@material-ui/icons/Menu"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import AccountTreeIcon from "@material-ui/icons/AccountTree"
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"
import ConnectButtons from "../jacdac/ConnectButtons"

export default function DrawerToolsButtonGroup(props: {
    className?: string
    showToc?: boolean
    showCurrent?: boolean
    showConnect?: boolean
}) {
    const { className, showToc, showCurrent, showConnect } = props
    const { drawerType, setDrawerType } = useContext(AppContext)

    const handleDrawer = (drawer: DrawerType) => () => setDrawerType(drawer)
    const drawers = [
        showToc && {
            drawer: DrawerType.Toc,
            label: "open table of contents",
            icon: <MenuIcon />,
        },
        {
            drawer: DrawerType.Dom,
            label: "open device tree",
            icon: <AccountTreeIcon />,
        },
        {
            drawer: DrawerType.Packets,
            label: "open packet console",
            icon: <HistoryIcon />,
        },
    ]
        .filter(d => !!d)
        .filter(d => showCurrent || d.drawer !== drawerType)

    return (
        <>
            {drawers.map(drawer => (
                <IconButtonWithTooltip
                    key={drawer.label}
                    title={drawer.label}
                    className={className}
                    color="inherit"
                    onClick={handleDrawer(drawer.drawer)}
                    edge="start"
                >
                    {" "}
                    {drawer.icon}
                </IconButtonWithTooltip>
            ))}
            {showConnect && <ConnectButtons transparent={true} full={false} />}
        </>
    )
}
