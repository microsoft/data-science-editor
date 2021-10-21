import React, { useContext } from "react"
// tslint:disable-next-line: no-submodule-imports
import AppContext, { DrawerType } from "../AppContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import BuildIcon from "@material-ui/icons/Build"
import MenuIcon from "@material-ui/icons/Menu"
export function ToolsButton(props: { className: string }) {
    const { className } = props
    const { setDrawerType } = useContext(AppContext)
    const handleDrawer = (drawerType: DrawerType) => () =>
        setDrawerType(drawerType)
    return (
        <>
            <IconButtonWithTooltip
                title={"Documentation"}
                className={className}
                trackName={`menu.drawer.toc`}
                color="inherit"
                onClick={handleDrawer(DrawerType.Toc)}
                edge="start"
            >
                <MenuIcon />
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                title={"Tools"}
                className={className}
                trackName={`menu.drawer.tools`}
                color="inherit"
                onClick={handleDrawer(DrawerType.Dom)}
                edge="start"
            >
                <BuildIcon />
            </IconButtonWithTooltip>
        </>
    )
}
