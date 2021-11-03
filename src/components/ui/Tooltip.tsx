import { Tooltip as MaterialTooltip } from "@mui/material"
import { styled } from "@mui/material/styles"

// fix for contrast issue
const Tooltip = styled(MaterialTooltip)(({ theme }) => ({
    [`& .tooltip`]: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
    },
}))

export default Tooltip
