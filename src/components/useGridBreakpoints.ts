import { GridSize } from "@mui/material"
import { useContext } from "react"
import AppContext, { DrawerType } from "./AppContext"

export interface GridBreakpoints {
    xs?: GridSize
    md?: GridSize
    sm?: GridSize
    lg?: GridSize
    xl?: GridSize
}

export default function useGridBreakpoints(
    itemCount?: number
): GridBreakpoints {
    const { drawerType } = useContext(AppContext)
    const hasDrawer = drawerType !== DrawerType.None

    if (!drawerType && itemCount !== undefined) {
        switch (itemCount) {
            case 1:
            case 2:
            case 3:
                return { xs: 12, sm: 6, md: 6, lg: 4, xl: 4 }
        }
    }

    if (hasDrawer) return { xs: 12, md: 6, sm: 6, lg: 6, xl: 4 }
    else
        return {
            xs: 12,
            sm: 6,
            md: 4,
            lg: 4,
            xl: 3,
        }
}
