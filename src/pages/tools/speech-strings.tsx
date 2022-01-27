import React, {
    lazy,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import { Card, CardActions, Grid, TextField } from "@mui/material"
import useChange from "../../jacdac/useChange"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { SRV_SETTINGS } from "../../../jacdac-ts/src/jdom/constants"
import IconButtonWithTooltip from "../../components/ui/IconButtonWithTooltip"
import DeleteIcon from "@mui/icons-material/Delete"
import { SettingsClient } from "../../../jacdac-ts/src/jdom/clients/settingsclient"
import useServiceClient from "../../components/useServiceClient"
import { clone, debounce } from "../../../jacdac-ts/src/jdom/utils"
import { jdpack, jdunpack } from "../../../jacdac-ts/src/jdom/pack"
import { randomDeviceId } from "../../../jacdac-ts/src/jdom/random"
import useServices from "../../components/hooks/useServices"
import { Button } from "gatsby-theme-material-ui"
import Alert from "../../components/ui/Alert"
import GridHeader from "../../components/ui/GridHeader"
import ConnectAlert from "../../components/alert/ConnectAlert"
import DeviceCardHeader from "../../components/devices/DeviceCardHeader"
import useGridBreakpoints from "../../components/useGridBreakpoints"
import Suspense from "../../components/ui/Suspense"
import useServiceProviderFromServiceClass from "../../components/hooks/useServiceProviderFromServiceClass"
const ImportButton = lazy(() => import("../../components/ImportButton"))
import ServiceManagerContext from "../../components/ServiceManagerContext"
import ShareIcon from "@mui/icons-material/Share"
import useSnackbar from "../../components/hooks/useSnackbar"

// all settings keys are prefixed with this string
const PREFIX = "@ph_"
// data layout format (18bytes)
const FORMAT = "s"
// data layout types
type FORMAT_TYPE = [string]

interface Phrase {
    key?: string
    phrase: string
}

function phraseToBuffer(ev: Phrase) {
    const payload = jdpack<FORMAT_TYPE>(FORMAT, [ev.phrase])

    return payload
}

function bufferToPhrase(key: string, data: Uint8Array): Phrase {
    const [phrase] = jdunpack<FORMAT_TYPE>(data, FORMAT)
    return {
        key,
        phrase,
    }
}

export default function HIDEvents() {
    const { setError } = useSnackbar()
    const settingsServices = useServices({ serviceClass: SRV_SETTINGS })
    const [settingsService, setSettingsService] = useState<JDService>()
    const [phrases, setPhrases] = useState<Phrase[]>([])
    const gridBreakpoints = useGridBreakpoints()
    const exportRef = useRef()
    const { fileStorage } = useContext(ServiceManagerContext)

    const factory = useCallback(srv => new SettingsClient(srv), [])
    const settings = useServiceClient(settingsService, factory)

    useServiceProviderFromServiceClass(SRV_SETTINGS)
    useChange(
        settings,
        debounce(async () => {
            const phrs: Phrase[] = []
            if (settings) {
                const all = await settings.list()
                for (const kv of all.filter(entry =>
                    entry.key?.startsWith(PREFIX)
                )) {
                    const { key, value } = kv
                    const he = bufferToPhrase(key, value)
                    if (he) phrs.push(he)
                }
            }
            // different? set the variable
            if (JSON.stringify(phrs) !== JSON.stringify(phrases))
                setPhrases(phrs)
        }, 500)
    )

    const handlePhraseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const index = Number.parseInt(event.target.id)
        const phrase = phrases[index]
        phrase.phrase = event.target.value
        setPhrases(phrases.slice())
    }

    const handleAddPhrase = () => {
        setPhrases([...phrases, { phrase: "" }])
    }

    const handleRemovePhrase = (index: number) => async () => {
        const { key } = phrases[index]
        if (key) await settings.deleteValue(key)
        setPhrases([...phrases.slice(0, index), ...phrases.slice(index)])
    }
    const handleSelectSettingsService = (service: JDService) => () =>
        setSettingsService(settingsService === service ? undefined : service)

    const handleClearPhrases = async () => {
        await Promise.all(
            phrases
                .filter(({ key }) => !!key)
                .map(phrase => settings.deleteValue(phrase.key))
        )
        setPhrases([])
    }

    const handleSavePhrases = () => {
        phrases.forEach(phrase => {
            if (!phrase.key) phrase.key = PREFIX + randomDeviceId()
            settings.setValue(phrase.key, phraseToBuffer(phrase))
        })
    }

    const handleExport = () => {
        fileStorage.saveText(
            `phrases.json`,
            JSON.stringify(
                clone(phrases).map(h => {
                    delete h.key
                    return h
                })
            )
        )
    }

    useEffect(() => {
        if (exportRef.current)
            (exportRef.current as HTMLAnchorElement).download = "phrases.json"
    }, [exportRef.current])
    const handleFilesUploaded = async (files: File[]) => {
        for (const file of files) {
            try {
                const text = await file.text()
                const json = JSON.parse(text)
                if (Array.isArray(json)) {
                    for (const phrase of json as Phrase[]) {
                        const payload = phraseToBuffer(phrase)
                        settings.setValue(PREFIX + randomDeviceId(), payload)
                    }
                }
            } catch (e) {
                console.warn(e)
                setError(`invalid file ${file.name}`)
            }
        }
    }
    return (
        <>
            <h1>Phrase configurator</h1>
            <Grid container spacing={1}>
                <GridHeader title="Select a phrase storage device" />
                {!settingsServices?.length && (
                    <Grid item xs>
                        <ConnectAlert serviceClass={SRV_SETTINGS} />
                    </Grid>
                )}
                {settingsServices
                    .filter(srv => !settingsService || srv === settingsService)
                    .map(srv => (
                        <Grid item key={srv.id} {...gridBreakpoints}>
                            <Card>
                                <DeviceCardHeader
                                    device={srv.device}
                                    showAvatar={true}
                                    showMedia={true}
                                />
                                <CardActions>
                                    <Button
                                        variant={"outlined"}
                                        onClick={handleSelectSettingsService(
                                            srv
                                        )}
                                    >
                                        {settingsService === srv
                                            ? "unselect"
                                            : "select"}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                {settings && (
                    <>
                        <GridHeader title="Phrase book" />
                        {!phrases?.length && (
                            <Grid item xs>
                                <Alert severity="info">
                                    No phrases yet! Click{" "}
                                    <strong>Add phrase</strong> to start
                                    building your phrase book.
                                </Alert>
                            </Grid>
                        )}
                        {phrases?.map(({ phrase }, index) => (
                            <Grid item {...gridBreakpoints} key={index}>
                                <TextField
                                    value={phrase}
                                    spellCheck={false}
                                    helperText={"Enter your phrase"}
                                    id={index.toString()}
                                    onChange={handlePhraseChange}
                                    multiline={false}
                                    rows={1}
                                    fullWidth={false}
                                />
                                <IconButtonWithTooltip
                                    title="delete"
                                    onClick={handleRemovePhrase(index)}
                                >
                                    <DeleteIcon />
                                </IconButtonWithTooltip>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleAddPhrase}
                                    >
                                        Add phrase
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSavePhrases}
                                    >
                                        Save all phrases
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={handleClearPhrases}
                                    >
                                        Clear all phrases
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        onClick={handleExport}
                                        startIcon={<ShareIcon />}
                                    >
                                        Export
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Suspense>
                                        <ImportButton
                                            icon={false}
                                            text="Import"
                                            onFilesUploaded={
                                                handleFilesUploaded
                                            }
                                            acceptedFiles={["application/json"]}
                                        />
                                    </Suspense>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Grid>
        </>
    )
}
