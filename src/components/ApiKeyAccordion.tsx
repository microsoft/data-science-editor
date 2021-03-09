import React, { useState } from "react"
import useDbValue from "./useDbValue"
import useEffectAsync from "./useEffectAsync"
import Alert from "./ui/Alert"
import {
    AccordionActions,
    AccordionSummary,
    AccordionDetails,
    Accordion,
    Typography,
    TextField,
    Box,
} from "@material-ui/core"
import { Button } from "gatsby-theme-material-ui"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline"
import { useSnackbar } from "notistack"
import { useId } from "react-use-id-hook"

export default function ApiKeyAccordion(props: {
    apiName: string
    title?: string
    validateKey?: (key: string) => Promise<{ statusCode: number }>
    instructions: JSX.Element | JSX.Element[]
}) {
    const { apiName, validateKey, instructions, title } = props
    const { value: apiKey, setValue: setApiKey } = useDbValue(apiName, "")
    const apiKeyId = useId()
    const [key, setKey] = useState("")
    const [expanded, setExpanded] = useState(!apiKey)
    const [validated, setValidated] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    useEffectAsync(
        async mounted => {
            if (!apiKey) {
                setValidated(false)
            } else {
                const { statusCode } = validateKey
                    ? await validateKey(apiKey)
                    : { statusCode: 200 }
                if (!mounted()) return
                if (statusCode === 200) {
                    setValidated(true)
                    setExpanded(false)
                } else {
                    setValidated(false)
                    if (statusCode === 403) setApiKey(undefined)
                }
            }
        },
        [apiKey]
    )

    const handleApiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setKey(event.target.value)
    }
    const handleSave = () => {
        setApiKey(key)
        setKey("")
        enqueueSnackbar("key saved...")
    }
    const handleReset = () => {
        setApiKey("")
        enqueueSnackbar("key cleared...")
    }

    const handleExpanded = () => {
        setExpanded(!expanded)
    }

    return (
        <Accordion expanded={expanded} onChange={handleExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1">{`${
                    title || "API key"
                } Configuration`}</Typography>
                {validated && (
                    <Box ml={1} color="success.main">
                        <CheckCircleOutlineIcon />
                    </Box>
                )}
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                {validated && (
                    <Alert severity={"success"}>API key ready!</Alert>
                )}
                {instructions}
                <TextField
                    id={apiKeyId}
                    autoFocus
                    label="API key"
                    fullWidth
                    value={key}
                    onChange={handleApiChange}
                />
            </AccordionDetails>
            <AccordionActions>
                <Button
                    aria-label="save api key"
                    disabled={!key}
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                >
                    Save
                </Button>
                <Button
                    aria-label="clear api key"
                    disabled={!apiKey}
                    variant="contained"
                    onClick={handleReset}
                >
                    Clear
                </Button>
            </AccordionActions>
        </Accordion>
    )
}
