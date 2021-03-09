import React from "react"
import { Box, Paper, useTheme } from "@material-ui/core";

export default function Widget(props: { children: any }) {
    const { children } = props;
    const theme = useTheme();
    return <Paper>
        <Box mx={1} p={theme.spacing(0.5)}>
            {children}
        </Box>
    </Paper>
}