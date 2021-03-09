import { Grid, TextField } from "@material-ui/core"
import React, { ChangeEvent, useEffect, useMemo, useState } from "react"
import {
    clone,
    JSONTryParse,
    SMap,
    uniqueName,
} from "../../../jacdac-ts/src/jdom/utils"
import useChange from "../../jacdac/useChange"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteIcon from "@material-ui/icons/Delete"
import {
    resolveMakecodeService,
    resolveMakecodeServiceFromClassIdentifier,
    serviceSpecifications,
} from "../../../jacdac-ts/src/jdom/spec"
import AddServiceIconButton from "../AddServiceIconButton"
import ServiceSpecificationSelect from "../ServiceSpecificationSelect"
import { escapeName } from "../../../jacdac-ts/src/azure-iot/dtdl"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useMakeCodeEditorExtensionClient, {
    READ,
    ReadResponse,
} from "./MakeCodeEditorExtensionClient"
import CmdButton from "../CmdButton"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SaveIcon from "@material-ui/icons/Save"
import { camelize } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import { useId } from "react-use-id-hook"

interface ClientRole {
    name: string
    service: number
}

interface Configuration {
    roles: ClientRole[]
}

function toTypescript(config: Configuration) {
    const ns = "myModules"
    return `// auto-generated, do not edit.
namespace ${ns} {
${config.roles
    .map(
        role => `
    //% fixedInstance block="${role.name}"
    export const ${camelize(role.name)} = new ${
            resolveMakecodeServiceFromClassIdentifier(role.service).client.qName
        }("${camelize(role.name)}");
`
    )
    .join("")}

    // start after main
    control.runInParallel(function() {
        ${config.roles
            .map(
                role => `    ${ns}.${camelize(role.name)}.start();
        `
            )
            .join("")}
    })
}
    `
}

function toDependencies(config: Configuration) {
    const r: SMap<string> = {}
    config?.roles.forEach(role => {
        const mk = resolveMakecodeServiceFromClassIdentifier(role.service)
        r[mk.client.name] = `github:${mk.client.repo}`
    })
    return r
}

function toJSON(config: Configuration) {
    return config && JSON.stringify(config, null, 4)
}

function ClientRoleRow(props: {
    config: Configuration
    component: ClientRole
    onUpdate: () => void
}) {
    const { component, onUpdate, config } = props
    const { name, service } = component
    const { nameError, serviceError } = useMemo(
        () => validateClientRole(config, component),
        [config, component]
    )
    const textId = useId()
    const handleComponentNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        component.name = escapeName(ev.target.value)
        onUpdate()
    }
    const handleSetService = (serviceClass: number) => {
        component.service = serviceClass
        onUpdate()
    }
    const handleComponentDelete = () => {
        config.roles.splice(config.roles.indexOf(component), 1)
        onUpdate()
    }
    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={4} md={6}>
                    <TextField
                        id={textId}
                        fullWidth={true}
                        error={!!nameError}
                        variant="outlined"
                        label="name"
                        helperText={nameError}
                        value={name}
                        onChange={handleComponentNameChange}
                    />
                </Grid>
                <Grid item xs={4} md={4}>
                    <ServiceSpecificationSelect
                        variant="outlined"
                        label="service"
                        serviceClass={service}
                        setServiceClass={handleSetService}
                        error={serviceError}
                    />
                </Grid>
                <Grid item>
                    <IconButtonWithTooltip
                        title="Remove service"
                        onClick={handleComponentDelete}
                    >
                        <DeleteIcon />
                    </IconButtonWithTooltip>
                </Grid>
            </Grid>
        </Grid>
    )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateClientRole(config: Configuration, role: ClientRole) {
    const serviceError: string = undefined
    const nameError: string = undefined
    // TODO
    return { serviceError, nameError }
}

export default function MakeCodeEditorExtension() {
    const client = useMakeCodeEditorExtensionClient()
    const connected = useChange(client, c => c?.connected)
    const [configuration, setConfiguration] = useState<Configuration>({
        roles: [],
    } as Configuration)
    useEffect(
        () =>
            client?.subscribe(READ, (resp: ReadResponse) => {
                console.log(`mkcd: read received`)
                const cfg = JSONTryParse(resp.json)
                console.log({ resp, cfg })
                if (cfg) setConfiguration(cfg)
            }),
        [client]
    )
    const hasMakeCodeService = (srv: jdspec.ServiceSpec) =>
        !!resolveMakecodeService(srv)
    const update = () => {
        setConfiguration(clone(configuration))
    }
    const handleAddService = (service: jdspec.ServiceSpec) => {
        if (!configuration.roles) configuration.roles = []
        const names = configuration.roles
            .map(c => c.name)
            .concat(serviceSpecifications().map(spec => spec.camelName))
            .filter(n => !!n)
        configuration.roles.push({
            name: uniqueName(names, service.camelName || service.shortId),
            service: service.classIdentifier,
        })
        update()
    }
    const handleSave = async () => {
        const ts = toTypescript(configuration)
        const json = toJSON(configuration)
        const deps = toDependencies(configuration)
        console.log(`mkcd: saving...`)
        await client.write(ts, json, undefined, deps)
    }

    return (
        <Grid container direction="row" spacing={2}>
            {configuration.roles?.map((c, i) => (
                <ClientRoleRow
                    key={"config" + i}
                    config={configuration}
                    component={c}
                    onUpdate={update}
                />
            ))}
            <Grid item xs={12}>
                <AddServiceIconButton
                    serviceFilter={hasMakeCodeService}
                    onAdd={handleAddService}
                />
            </Grid>
            <Grid item xs={12}>
                <CmdButton
                    trackName="makecode.save"
                    variant="contained"
                    disabled={!connected}
                    icon={<SaveIcon />}
                    onClick={handleSave}
                >
                    save
                </CmdButton>
            </Grid>
        </Grid>
    )
}
