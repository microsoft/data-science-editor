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

const Video = lazy(() => import("./ui/Video"))
const MakeCodeProjects = lazy(() => import("./makecode/MakeCodeProjects"))
const MakeCodeExtensionFooter = lazy(
    () => import("./makecode/MakeCodeExtensionFooter")
)
const MakeCodeProjectFooter = lazy(
    () => import("./makecode/MakeCodeProjectFooter")
)
const CodeBlock = lazy(() => import("./CodeBlock"))
const RandomGenerator = lazy(() => import("./RandomGenerator"))
const TraceList = lazy(() => import("./trace/TraceList"))
const SpecificationUnitList = lazy(() => import("./SpecificationUnitList"))
const DeviceImage = lazy(() => import("./devices/DeviceImage"))
const YouTubeButton = lazy(() => import("./youtube/YouTubeButton"))
const DeviceSpecificationList = lazy(
    () => import("./specification/DeviceSpecificationList")
)
const ModuleImageList = lazy(() => import("./home/ModuleImageList"))
const BrainImageList = lazy(() => import("./home/BrainImageList"))
const JacdaptorImageList = lazy(() => import("./home/JacdaptorImageList"))
const EC30Editor = lazy(() => import("./ec30/EC30Editor"))
const GithubRepositoryCard = lazy(() => import("./github/GithubRepositoryCard"))
const MakeCodeOpenSnippetButton = lazy(
    () => import("./makecode/MakeCodeOpenSnippetButton")
)

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
            RandomGenerator: props => (
                <Suspense>
                    <Box displayPrint="none">
                        <RandomGenerator {...props} />
                    </Box>
                </Suspense>
            ),
            TraceList: props => (
                <Suspense>
                    <TraceList {...props} />
                </Suspense>
            ),
            SpecificationUnitList: props => (
                <Suspense>
                    <SpecificationUnitList {...props} />
                </Suspense>
            ),
            DeviceImage: props => (
                <Suspense>
                    <DeviceImage {...props} />
                </Suspense>
            ),
            MakeCodeProjects: props => (
                <Suspense>
                    <MakeCodeProjects {...props} />
                </Suspense>
            ),
            MakeCodeExtensionFooter: props => (
                <Suspense>
                    <MakeCodeExtensionFooter {...props} />
                </Suspense>
            ),
            MakeCodeProjectFooter: props => (
                <Suspense>
                    <MakeCodeProjectFooter {...props} />
                </Suspense>
            ),
            YouTubeButton: props => (
                <Suspense>
                    <YouTubeButton {...props} />
                </Suspense>
            ),
            DeviceSpecificationList: props => (
                <Suspense>
                    <DeviceSpecificationList sx={{ mb: 2 }} {...props} />
                </Suspense>
            ),
            ModuleImageList: props => (
                <Suspense>
                    <ModuleImageList {...props} />
                </Suspense>
            ),
            BrainImageList: props => (
                <Suspense>
                    <BrainImageList {...props} />
                </Suspense>
            ),
            JacdaptorImageList: props => (
                <Suspense>
                    <JacdaptorImageList {...props} />
                </Suspense>
            ),
            EC30Editor: props => (
                <Suspense>
                    <EC30Editor {...props} />
                </Suspense>
            ),
            Alert: props => <Alert {...props} />,
            AlertTitle: props => <AlertTitle {...props} />,
            Video: props => (
                <Suspense>
                    <Video {...props} />
                </Suspense>
            ),
            GithubRepositoryCard: props => (
                <Suspense>
                    <GithubRepositoryCard {...props} />
                </Suspense>
            ),
            MakeCodeOpenSnippetButton: props => (
                <Suspense>
                    <MakeCodeOpenSnippetButton {...props} />
                </Suspense>
            ),
        }),
        []
    )

    return mdxComponents
}
