import React, { lazy, useMemo } from "react"
import { Link } from "gatsby-theme-material-ui"
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
} from "@mui/material"

import Suspense from "./ui/Suspense"
import Alert from "./ui/Alert"
import { AlertTitle } from "@mui/material"

const CodeBlock = lazy(() => import("./CodeBlock"))

export default function useMdxComponents() {
    const theme = useTheme()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mdxComponents: any = useMemo(
        () => ({
            Link: props => <Link color="textPrimary" {...props} />,
            a: (props: { href: string }) => (
                <Link
                    color="textPrimary"
                    {...props}
                    rel="noopener noreferrer"
                />
            ),
            pre: props => (
                <Box mb={theme.spacing(3)}>
                    <Paper>
                        <div {...props} />
                    </Paper>
                </Box>
            ),
            table: props => (
                <Box mb={theme.spacing(0.5)}>
                    <TableContainer component={Paper}>
                        <Box m={theme.spacing(0.5)}>
                            <Table size="small" {...props} />
                        </Box>
                    </TableContainer>
                </Box>
            ),
            thead: props => <TableHead {...props} />,
            tbody: props => <TableBody {...props} />,
            tr: props => <TableRow {...props} />,

            code: props => (
                <Suspense>
                    <CodeBlock {...props} />
                </Suspense>
            ),
            Alert: props => <Alert {...props} />,
            AlertTitle: props => <AlertTitle {...props} />,
        }),
        []
    )

    return mdxComponents
}
