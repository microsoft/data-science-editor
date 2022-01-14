import { Card, CardActions, CardContent, Grid, TextField } from "@mui/material"
import React, {
    ChangeEvent,
    lazy,
    useCallback,
    useContext,
    useState,
} from "react"
import { JDService } from "../../jacdac-ts/src/jdom/service"
import DeviceCardHeader from "./devices/DeviceCardHeader"
import useServiceClient from "./useServiceClient"
import { SettingsClient } from "../../jacdac-ts/src/jdom/clients/settingsclient"
import { useChangeAsync } from "../jacdac/useChange"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteIcon from "@mui/icons-material/Delete"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import AddIcon from "@mui/icons-material/Add"
import CmdButton from "./CmdButton"
import { useId } from "react-use-id-hook"
import LoadingProgress from "./ui/LoadingProgress"
import SwitchWithLabel from "./ui/SwitchWithLabel"
import { bufferToString } from "../../jacdac-ts/src/jdom/utils"
import { randomDeviceId } from "../../jacdac-ts/src/jdom/random"
import { Button } from "gatsby-material-ui-components"
import ServiceManagerContext from "./ServiceManagerContext"
import Suspense from "./ui/Suspense"
import AppContext from "./AppContext"
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt"

const ImportButton = lazy(() => import("./ImportButton"))

function SettingRow(props: {
    client: SettingsClient
    name: string
    value?: string
    mutable: boolean
    showSecrets: boolean
    autoKey: boolean
}) {
    const { client, name, value, mutable, autoKey } = props
    const isSecret = name[0] == "$"
    const displayName = isSecret ? name.slice(1) : name
    const handleComponentDelete = async () => {
        await client.deleteValue(name)
    }
    const keyId = useId()
    const valueId = useId()
    const nameError = ""
    const valueError = ""
    return (
        <Grid item xs={12}>
            <Grid container spacing={1}>
                {!autoKey && (
                    <Grid item>
                        <TextField
                            id={keyId}
                            error={!!nameError}
                            variant="outlined"
                            label="key"
                            helperText={nameError}
                            value={displayName}
                            disabled={true}
                        />
                    </Grid>
                )}
                <Grid item xs>
                    <TextField
                        id={valueId}
                        fullWidth={true}
                        error={!!valueError}
                        variant="outlined"
                        helperText={valueError}
                        value={isSecret ? "..." : value}
                        disabled={true}
                    />
                </Grid>
                {mutable && (
                    <Grid item>
                        <CmdButton
                            trackName="settings.delete"
                            title="Delete settings"
                            onClick={handleComponentDelete}
                            icon={<DeleteIcon />}
                        />
                    </Grid>
                )}
            </Grid>
        </Grid>
    )
}

function AddSettingRow(props: {
    client: SettingsClient
    keyPrefix: string
    showSecrets: boolean
    autoKey: boolean
}) {
    const { client, keyPrefix, showSecrets, autoKey } = props
    const [name, setName] = useState("")
    const [value, setValue] = useState("")
    const [secret, setSecret] = useState(showSecrets)
    const keyId = useId()
    const valueId = useId()

    const handleNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setName(ev.target.value.trim())
    }
    const handleValueChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setValue(ev.target.value)
    }
    const handleChecked = (ev, checked: boolean) => {
        setSecret(checked)
    }
    const handleAdd = async mounted => {
        const keyName = autoKey ? randomDeviceId() : name
        const key = `${secret ? "$" : ""}${keyPrefix || ""}${keyName}`
        await client.setStringValue(key, value)
        if (!mounted()) return
        setName("")
        setValue("")
        setSecret(showSecrets)
    }
    const keyError = ""
    const valueError = ""

    return (
        <Grid item xs={12}>
            <Grid container spacing={1} alignContent="center">
                {!autoKey && (
                    <Grid item>
                        <TextField
                            id={keyId}
                            error={!!keyError}
                            variant="outlined"
                            label="Add key"
                            helperText={keyError}
                            value={name}
                            onChange={handleNameChange}
                        />
                    </Grid>
                )}
                <Grid item xs>
                    <TextField
                        id={valueId}
                        fullWidth={true}
                        error={!!valueError}
                        variant="outlined"
                        label="value"
                        helperText={valueError}
                        value={value}
                        onChange={handleValueChange}
                    />
                </Grid>
                {showSecrets && (
                    <Grid item>
                        <SwitchWithLabel
                            checked={secret}
                            onChange={handleChecked}
                            label="Secret"
                        />
                    </Grid>
                )}
                <Grid item>
                    <CmdButton
                        trackName="settings.add"
                        variant="contained"
                        disabled={
                            (!autoKey && !name) || !!keyError || !!valueError
                        }
                        title="Add setting"
                        onClick={handleAdd}
                        icon={<AddIcon />}
                    />
                </Grid>
            </Grid>
        </Grid>
    )
}

function ImportSettingsButton(props: { client: SettingsClient }) {
    const { client } = props
    const { setError } = useContext(AppContext)

    const handleFilesUploaded = async (files: File[]) => {
        for (const file of files) {
            try {
                const text = await file.text()
                const json = JSON.parse(text)
                if (Array.isArray(json)) {
                    for (const entry of json as {
                        key: string
                        value: string
                    }[]) {
                        const { key, value } = entry
                        if (key) await client.setStringValue(key, value)
                    }
                }
            } catch (e) {
                console.warn(e)
                setError(`invalid file ${file.name}`)
            }
        }
    }
    return (
        <Suspense>
            <ImportButton
                icon={false}
                text="Import"
                onFilesUploaded={handleFilesUploaded}
                acceptedFiles={["application/json"]}
            />
        </Suspense>
    )
}

export default function SettingsCard(props: {
    service: JDService
    mutable?: boolean
    keyPrefix?: string
    showSecrets?: boolean
    autoKey?: boolean
}) {
    const { service, mutable, keyPrefix = "", showSecrets, autoKey } = props
    const { fileStorage } = useContext(ServiceManagerContext)
    const factory = useCallback(srv => new SettingsClient(srv), [])
    const client = useServiceClient(service, factory)
    const values = useChangeAsync(
        client,
        async c => {
            const keys = await c?.list()
            return keys
                ?.filter(({ key }) => !keyPrefix || key.startsWith(keyPrefix))
                .map(({ key, value }) => ({
                    key,
                    value: bufferToString(value),
                }))
        },
        [keyPrefix]
    )

    const secrets = values?.filter(value => showSecrets && value.key[0] === "$")
    const publics = values?.filter(value => value.key[0] !== "$")

    const handleClear = async () => await client?.clear()
    const handleExport = () =>
        fileStorage.saveText(
            "settings.json",
            JSON.stringify(publics || {}, null, 2)
        )

    if (!client) return <LoadingProgress /> // wait till loaded

    return (
        <Card>
            <DeviceCardHeader device={service.device} showAvatar={true} />
            <CardContent>
                <Grid container spacing={2}>
                    {mutable && (
                        <AddSettingRow
                            client={client}
                            keyPrefix={keyPrefix}
                            showSecrets={showSecrets}
                            autoKey={autoKey}
                        />
                    )}
                    {publics?.map(({ key, value }) => (
                        <SettingRow
                            key={key}
                            name={key}
                            value={value}
                            client={client}
                            mutable={mutable}
                            showSecrets={showSecrets}
                            autoKey={autoKey}
                        />
                    ))}
                    {!!secrets?.length && (
                        <Grid item xs={12}>
                            Secrets
                        </Grid>
                    )}
                    {secrets?.map(({ key, value }) => (
                        <SettingRow
                            key={key}
                            name={key}
                            value={value}
                            client={client}
                            mutable={mutable}
                            showSecrets={showSecrets}
                            autoKey={autoKey}
                        />
                    ))}
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container spacing={1} direction="row">
                    {mutable && (
                        <Grid item>
                            <CmdButton
                                variant="outlined"
                                trackName="settings.clearall"
                                title="Clear all settings"
                                icon={<DeleteIcon />}
                                onClick={handleClear}
                            >
                                Clear
                            </CmdButton>
                        </Grid>
                    )}
                    <Grid item>
                        <Button
                            variant="outlined"
                            title="export"
                            disabled={!values}
                            onClick={handleExport}
                            startIcon={<SystemUpdateAltIcon />}
                        >
                            Export
                        </Button>
                    </Grid>
                    <Grid item>
                        <ImportSettingsButton client={client} />
                    </Grid>
                </Grid>
            </CardActions>
        </Card>
    )
}
