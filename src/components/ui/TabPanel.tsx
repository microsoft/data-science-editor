import React from "react"
import { Box, Typography } from "@material-ui/core";
import { useId } from "react-use-id-hook"

export default function TabPanel(props: {
    children?: React.ReactNode;
    index: any;
    value: any;
}) {
    const { children, value, index, ...other } = props;
    const did = useId();

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={did}
            aria-labelledby={did}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography component="span">{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export function a11yProps(index: any) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}