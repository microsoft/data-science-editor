import {
    Card,
    CardActions,
    CardContent,
    Grid,
    Switch,
    TextField,
} from "@material-ui/core"
import React, { ChangeEvent, useState } from "react"
import { JDService } from "../../jacdac-ts/src/jdom/service"
import DeviceCardHeader from "./DeviceCardHeader"
import useServiceClient from "./useServiceClient"
import SettingsClient from "../../jacdac-ts/src/jdom/settingsclient"
import { useChangeAsync } from "../jacdac/useChange"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteIcon from "@material-ui/icons/Delete"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import AddIcon from "@material-ui/icons/Add"
import CmdButton from "./CmdButton"
import { useId } from "react-use-id-hook"
import LoadingProgress from "./ui/LoadingProgress"

function SettingRow(props: {
    client: SettingsClient
    name: string
    value?: string
    mutable?: boolean
}) {
    const { client, name, value, mutable } = props
    const isSecret = name[0] == "$"
    const displayName = isSecret ? name.slice(1) : name
    const handleComponentDelete = async () => {
        await client.deleteValue(name)
    }
    const nameError = ""
    const valueError = ""
    return (
        <Grid item xs={12}>
            <Grid container spacing={1}>
                <Grid item>
                    <TextField
                        error={!!nameError}
                        variant="outlined"
                        label="key"
                        helperText={nameError}
                        value={displayName}
                        disabled={true}
                    />
                </Grid>
                <Grid item xs>
                    <TextField
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

function AddSettingRow(props: { client: SettingsClient }) {
    const { client } = props
    const [name, setName] = useState("")
    const [value, setValue] = useState("")
    const [secret, setSecret] = useState(true)
    const secretLabelId = useId()

    const handleNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setName(ev.target.value.trim())
    }
    const handleValueChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setValue(ev.target.value)
    }
    const handleChecked = (ev, checked: boolean) => {
        setSecret(checked)
    }
    const handleAdd = async () => {
        await client.setValue(`${secret ? "$" : ""}${name}`, value)
        setName("")
        setValue("")
        setSecret(true)
    }
    const keyError = ""
    const valueError = ""

    return (
        <Grid item xs={12}>
            <Grid container spacing={1} alignContent="center">
                <Grid item>
                    <TextField
                        error={!!keyError}
                        variant="outlined"
                        label="Add key"
                        helperText={keyError}
                        value={name}
                        onChange={handleNameChange}
                    />
                </Grid>
                <Grid item xs>
                    <TextField
                        fullWidth={true}
                        error={!!valueError}
                        variant="outlined"
                        label="value"
                        helperText={valueError}
                        value={value}
                        onChange={handleValueChange}
                    />
                </Grid>
                <Grid item>
                    <Switch
                        checked={secret}
                        onChange={handleChecked}
                        aria-labelledby={secretLabelId}
                    />
                    <label id={secretLabelId}>Secret</label>
                </Grid>
                <Grid item>
                    <CmdButton
                        trackName="settings.add"
                        variant="contained"
                        disabled={!name || !!keyError || !!valueError}
                        title="Add setting"
                        onClick={handleAdd}
                        icon={<AddIcon />}
                    />
                </Grid>
            </Grid>
        </Grid>
    )
}

export default function SettingsCard(props: {
    service: JDService
    mutable?: boolean
}) {
    const { service, mutable } = props
    const client = useServiceClient(service, srv => new SettingsClient(srv))
    const values = useChangeAsync(client, c => c?.list())
    const handleClear = async () => await client?.clear()

    if (!client) return <LoadingProgress /> // wait till loaded

    return (
        <Card>
            <DeviceCardHeader device={service.device} showAvatar={true} />
            <CardContent>
                <Grid container spacing={2}>
                    {values?.map(({ key, value }) => (
                        <SettingRow
                            key={key}
                            name={key}
                            value={value}
                            client={client}
                            mutable={mutable}
                        />
                    ))}
                    {mutable && <AddSettingRow client={client} key="add" />}
                </Grid>
            </CardContent>
            {mutable && (
                <CardActions>
                    <CmdButton
                        trackName="settings.clearall"
                        title="Clear all settings"
                        icon={<DeleteIcon />}
                        onClick={handleClear}
                    >
                        Clear
                    </CmdButton>
                </CardActions>
            )}
        </Card>
    )
}
