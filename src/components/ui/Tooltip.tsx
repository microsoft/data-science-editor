import { IconButtonProps, Theme, Tooltip as MaterialTooltip, withStyles } from "@material-ui/core";
import { IconButton } from "gatsby-theme-material-ui";
import React from "react";
import Zoom from '@material-ui/core/Zoom';

// fix for contrast issue
const Tooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
    },
}))(MaterialTooltip);

export default Tooltip;