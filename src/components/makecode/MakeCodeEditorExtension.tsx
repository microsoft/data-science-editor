import { Grid, TextField } from "@mui/material"
import React, { ChangeEvent, useEffect, useMemo, useState } from "react"
import {
    clone,
    JSONTryParse,
    uniqueName,
} from "../../../jacdac-ts/src/jdom/utils"
import useChange from "../../jacdac/useChange"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteIcon from "@mui/icons-material/Delete"
import { serviceSpecifications } from "../../../jacdac-ts/src/jdom/spec"
import AddServiceIconButton from "../AddServiceIconButton"
import ServiceSpecificationSelect from "../specification/ServiceSpecificationSelect"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useMakeCodeEditorExtensionClient, {
    READ,
    ReadResponse,
} from "./MakeCodeEditorExtensionClient"
import CmdButton from "../CmdButton"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SaveIcon from "@mui/icons-material/Save"
import { camelize } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import { useId } from "react-use-id-hook"
import {
    resolveMakecodeService,
    resolveMakecodeServiceFromClassIdentifier,
} from "./services"

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
    const r: Record<string, string> = {}
    config?.roles.forEach(role => {
        const mk = resolveMakecodeServiceFromClassIdentifier(role.service)
        r[mk.client.name] = `github:${mk.client.repo}`
    })
    return r
}

function toJSON(config: Configuration) {
    return config && JSON.stringify(config, null, 4)
}

function escapeName(name: string) {
    // TODO: makecode component escape name
    return name
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
    // TODO: properly validate client role
    return { serviceError, nameError }
}

/**
 * To test locally, add ?localeditorextensions=1&debugextensions=1
 */
export default function MakeCodeEditorExtension() {
    const client = useMakeCodeEditorExtensionClient()
    const target = useChange(client, _ => _?.target)
    const connected = useChange(client, c => c?.connected)
    const [configuration, setConfiguration] = useState<Configuration>({
        roles: [],
    } as Configuration)
    useEffect(
        () =>
            client?.subscribe(READ, (resp: ReadResponse) => {
                console.log(`mkcd: read received`)
                const cfg = JSONTryParse<Configuration>(resp.json)
                console.log({ resp, cfg })
                if (cfg) setConfiguration(cfg)
            }),
        [client]
    )
    const hasMakeCodeService = (srv: jdspec.ServiceSpec) => {
        const mkc = resolveMakecodeService(srv)
        return (
            mkc &&
            target &&
            (!mkc.client.targets || mkc.client.targets.indexOf(target.id) > -1)
        )
    }
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
