import React, { useEffect, useState } from "react"
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    SelectChangeEvent,
    Typography,
} from "@mui/material"
import {
    fetchFirmwareReleaseBinary,
    GithubFirmwareRelease,
    useLatestFirmwareReleases,
} from "../github"
import { useFirmwareBlob } from "./useFirmwareBlobs"
import GithubRepositoryCardHeader from "../GithubRepositoryCardHeader"
import Alert from "../ui/Alert"
import { Link } from "gatsby-theme-material-ui"
import SelectWithLabel from "../ui/SelectWithLabel"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import LoadingProgress from "../ui/LoadingProgress"

export default function FirmwareCard(props: { slug: string }) {
    const { slug } = props
    const { response: releases } = useLatestFirmwareReleases(slug)
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState("")
    const [release, setRelease] = useState<GithubFirmwareRelease>(undefined)
    const [firmwaresExpanded, setFirmwaresExpanded] = useState(false)
    const { setFirmwareFile, firmwareBlobs } = useFirmwareBlob(slug)
    const tag = release?.version || ""
    const disabled = downloading
    const version = firmwareBlobs?.[0].version
    // version starts with v
    const updateAvailable =
        !!tag &&
        !!version &&
        tag !== version.replace(/^v/, "").substring(0, tag.length)
    const downloadColor = updateAvailable ? "primary" : "inherit"
    const downloadVariant = updateAvailable ? "contained" : "text"

    // initialize with latest release
    useEffect(() => {
        if (releases?.length && !release) setRelease(releases[0])
    }, [releases, release])

    const handleReleaseChange = (ev: SelectChangeEvent<string>) => {
        const v = ev.target.value as string
        const rel = releases?.find(r => r.version === v)
        setRelease(rel)
    }
    const handleGitHubReleaseDownload = async () => {
        try {
            setError("")
            setDownloading(true)
            const firmware = await fetchFirmwareReleaseBinary(slug, tag)
            if (firmware) setFirmwareFile(tag, firmware)
        } finally {
            setDownloading(false)
        }
    }
    const handleClear = async () => {
        try {
            setError("")
            setDownloading(true)
            setFirmwareFile(tag, undefined)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <Card>
            <GithubRepositoryCardHeader slug={slug} />
            <CardContent>
                {error && <Alert severity="error">{error}</Alert>}
                {!firmwareBlobs?.length && (
                    <Alert severity="info">
                        No firmware binary found in repository.
                    </Alert>
                )}
                {!!firmwareBlobs?.length && (
                    <Box mb={1}>
                        <Accordion
                            expanded={firmwaresExpanded}
                            onChange={() =>
                                setFirmwaresExpanded(!firmwaresExpanded)
                            }
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body2">
                                    <code>{version}</code>
                                    <span>
                                        {" "}
                                        ({firmwareBlobs.length} firmwares)
                                    </span>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List dense>
                                    {firmwareBlobs.map(blob => (
                                        <ListItem key={blob.productIdentifier}>
                                            <ListItemText
                                                primary={blob.name}
                                                secondary={
                                                    <Link
                                                        to={`/firmwares/0x${blob.productIdentifier.toString(
                                                            16
                                                        )}`}
                                                    >
                                                        {`0x${blob.productIdentifier.toString(
                                                            16
                                                        )}`}
                                                    </Link>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                )}
                {releases?.length === 0 && (
                    <Alert severity="warning">No releases found.</Alert>
                )}
                {!!releases?.length && (
                    <SelectWithLabel
                        fullWidth={true}
                        helperText="choose a version"
                        value={tag}
                        onChange={handleReleaseChange}
                    >
                        {releases?.map(rel => (
                            <MenuItem key={rel.version} value={rel.version}>
                                {rel.version}
                            </MenuItem>
                        ))}
                    </SelectWithLabel>
                )}
            </CardContent>
            <CardActions>
                {!downloading && release && (
                    <Button
                        disabled={downloading}
                        color={downloadColor}
                        variant={downloadVariant}
                        aria-label={`Download last release from ${slug}`}
                        onClick={handleGitHubReleaseDownload}
                    >
                        Download
                    </Button>
                )}
                {!downloading && firmwareBlobs?.length && (
                    <Button
                        disabled={disabled}
                        variant="text"
                        arial-label={"Clear"}
                        onClick={handleClear}
                    >
                        Clear
                    </Button>
                )}
                {downloading && <LoadingProgress />}
            </CardActions>
        </Card>
    )
}
