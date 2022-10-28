import React, { useContext } from "react"
// tslint:disable-next-line: no-submodule-imports
import AppContext, { DrawerType } from "../AppContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import BuildIcon from "@mui/icons-material/Build"
import MenuIcon from "@mui/icons-material/Menu"
import BrainManagerContext from "../brains/BrainManagerContext"
export default function DrawerToolsButton(props: { className: string }) {
    const { className } = props
    const { brainManager } = useContext(BrainManagerContext)
    const { setDrawerType } = useContext(AppContext)
    const handleDrawer = (drawerType: DrawerType) => () =>
        setDrawerType(drawerType)
    return (
        <>
            {!brainManager && (
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
            )}
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
