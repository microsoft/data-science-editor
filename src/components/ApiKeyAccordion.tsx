import React, { ReactNode, useContext, useState } from "react"
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
} from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import { useId } from "react-use-id-hook"
import AppContext from "./AppContext"

export default function ApiKeyAccordion(props: {
    title?: string
    validateKey?: (key: string) => Promise<{ status: number }>
    defaultExpanded?: boolean
    children: ReactNode
    apiKey: string
    setApiKey: (value: string) => void
}) {
    const { validateKey, title, children, defaultExpanded, apiKey, setApiKey } =
        props
    const apiKeyId = useId()
    const [key, setKey] = useState("")
    const [expanded, setExpanded] = useState(!apiKey || defaultExpanded)
    const [validated, setValidated] = useState(false)
    const { enqueueSnackbar } = useContext(AppContext)

    useEffectAsync(
        async mounted => {
            if (!apiKey) {
                setValidated(false)
            } else {
                const { status } = validateKey
                    ? await validateKey(apiKey)
                    : { status: 200 }
                if (!mounted()) return
                if (status === 200) {
                    setValidated(true)
                    setExpanded(false)
                } else {
                    setValidated(false)
                    if (status === 403) setApiKey(undefined)
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
                <Typography component="span" variant="caption">
                    {children}
                </Typography>
                <TextField
                    id={apiKeyId}
                    label="API key"
                    fullWidth
                    value={key}
                    type="password"
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
