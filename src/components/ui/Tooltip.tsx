import { Theme, Tooltip as MaterialTooltip, withStyles } from "@material-ui/core";

// fix for contrast issue
const Tooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
    },
}))(MaterialTooltip);

export default Tooltip;