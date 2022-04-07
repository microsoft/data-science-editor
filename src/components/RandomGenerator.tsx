import React, { useState } from "react"
import {
    Card,
    CardContent,
    CardActions,
    CardHeader,
    Typography,
    Input,
} from "@mui/material"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import CheckIcon from "@mui/icons-material/Check"
// tslint:disable-next-line: no-submodule-imports
import Alert from "./ui/Alert"
import { Button } from "gatsby-theme-material-ui"
import { NoSsr } from "@mui/material"
import { useId } from "react"
import useDeviceCatalog from "./devices/useDeviceCatalog"

export default function RandomGenerator(props: {
    device?: boolean
    firmware?: boolean
}) {
    const { device, firmware } = props
    const fieldId = useId()
    const deviceCatalog = useDeviceCatalog()

    const [value, setValue] = useState(
        device
            ? deviceCatalog.uniqueDeviceId()
            : deviceCatalog.uniqueServiceId()
    )
    const [copySuccess, setCopySuccess] = useState(false)

    const handleRegenerate = () => {
        const v = device
            ? deviceCatalog.uniqueDeviceId()
            : firmware
            ? deviceCatalog.uniqueFirmwareId()
            : deviceCatalog.uniqueServiceId()
        setValue(v)
        setCopySuccess(false)
    }
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopySuccess(true)
        } catch (err) {
            setCopySuccess(false)
        }
    }
    const title = device
        ? "Random Device Identifier"
        : firmware
        ? "Random Product Identifier"
        : "Random Service Identifier"
    return (
        <NoSsr>
            <Card>
                <CardHeader title={title} />
                <CardContent>
                    {value !== undefined && (
                        <Typography variant="h5" component="h2">
                            <Input
                                id={fieldId}
                                value={value}
                                readOnly={true}
                                inputProps={{
                                    "aria-label": "generated identifier",
                                }}
                            />
                            {copySuccess && <CheckIcon />}
                        </Typography>
                    )}
                    {value === undefined && (
                        <Alert severity="error">
                            Oops, unable to generate a strong random number.
                        </Alert>
                    )}
                </CardContent>
                <CardActions>
                    <Button
                        aria-label="copy random number to clipboard"
                        size="small"
                        variant="contained"
                        onClick={handleCopy}
                    >
                        Copy
                    </Button>
                    <Button
                        aria-label="regenerate random number"
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleRegenerate}
                    >
                        Regenerate
                    </Button>
                </CardActions>
            </Card>
        </NoSsr>
    )
}
