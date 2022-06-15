import { Grid, TextField, Typography } from "@mui/material"
import React, { ChangeEvent, useMemo } from "react"
import { clone, uniqueName } from "../../../jacdac-ts/src/jdom/utils"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteIcon from "@mui/icons-material/Delete"
import { serviceSpecifications } from "../../../jacdac-ts/src/jdom/spec"
import AddServiceIconButton from "../AddServiceIconButton"
import ServiceSpecificationSelect from "../specification/ServiceSpecificationSelect"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useMakeCodeEditorExtensionClient, {
    ClientRole,
    Configuration,
} from "./MakeCodeEditorExtensionContext"
import { useId } from "react"
import { resolveMakecodeService } from "./services"

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
                        label="role name"
                        helperText={nameError}
                        value={name}
                        size="small"
                        onChange={handleComponentNameChange}
                    />
                </Grid>
                <Grid item xs={4} md={4}>
                    <ServiceSpecificationSelect
                        variant="outlined"
                        label="role service"
                        serviceClass={service}
                        setServiceClass={handleSetService}
                        error={serviceError}
                    />
                </Grid>
                <Grid item>
                    <IconButtonWithTooltip
                        title="Remove role"
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
export default function MakeRoleCodeEditorExtension() {
    const { target, configuration, setConfiguration } =
        useMakeCodeEditorExtensionClient()

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
            name: uniqueName(
                names,
                service.camelName || service.shortId,
                "",
                3
            ),
            service: service.classIdentifier,
        })
        update()
    }

    return (
        <Grid container direction="row" spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Configure roles</Typography>
                <Typography variant="caption">
                    The roles define which Jacdac services (sensor or actuators)
                    are needed in your program. Use this dialog to define
                    multiple roles using the same type of service, like multiple
                    button roles. For each services, there is always one or two
                    default roles (for example <code>button1</code> and{" "}
                    <code>button2</code>) that is already defined.
                </Typography>
            </Grid>
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
        </Grid>
    )
}
