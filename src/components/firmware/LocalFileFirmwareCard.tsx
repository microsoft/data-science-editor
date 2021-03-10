import React, { lazy, useState } from "react"
import { Button, Card, CardHeader, CardActions, CardContent, ListItem, List, ListItemText, Typography } from "@material-ui/core";
import { useFirmwareBlob } from "./useFirmwareBlobs";
import Alert from "../ui/Alert";
import Suspense from "../ui/Suspense"
const ImportButton = lazy(() => import("../ImportButton"))

const LOCAL_FILE_SLUG = "local file";

export default function LocalFileFirmwareCard() {
    const slug = LOCAL_FILE_SLUG;
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState("")
    const { setFirmwareFile, firmwareBlobs } = useFirmwareBlob(slug)
    const disabled = downloading;
    const version = firmwareBlobs?.[0].version

    const handleFiles = async (files: File[]) => {
        const file = files[0]
        if (file) {
            try {
                setDownloading(true)
                await setFirmwareFile(undefined, file)
            } finally {
                setDownloading(false)
            }
        }
    }

    const handleClear = async () => {
        try {
            setError("")
            setDownloading(true)
            setFirmwareFile(undefined, undefined)
        }
        finally {
            setDownloading(false)
        }
    }

    return <Card>
        <CardHeader
            title={slug} />
        <CardContent>
            {error && <Alert severity="error">{error}</Alert>}
            {version && <Typography variant="body2">version <code>{version}</code></Typography>}
            {!!firmwareBlobs?.length && <List dense>
                {firmwareBlobs.map(blob => <ListItem key={blob.firmwareIdentifier}>
                    <ListItemText primary={blob.name} secondary={`0x${blob.firmwareIdentifier.toString(16)}`} />
                </ListItem>)}
            </List>}
        </CardContent>
        <CardActions>
            {!downloading && <Suspense><ImportButton text={"Import UF2 file"} onFilesUploaded={handleFiles} /></Suspense>}
            {!downloading && firmwareBlobs?.length && <Button disabled={disabled} variant="text" arial-label={"Clear"} onClick={handleClear}>
                Clear
            </Button>}
        </CardActions>
    </Card>
}