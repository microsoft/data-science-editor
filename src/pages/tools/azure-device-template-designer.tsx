import { Grid, TextField, Typography } from "@material-ui/core"
import React, { ChangeEvent, useMemo } from "react"
import { clone, uniqueName } from "../../../jacdac-ts/src/jdom/utils"
import useLocalStorage from "../../components/hooks/useLocalStorage"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteIcon from "@material-ui/icons/Delete"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import AddServiceIconButton from "../../components/AddServiceIconButton"
import ServiceSpecificationSelect from "../../components/ServiceSpecificationSelect"
import { DTDL_CONTEXT, escapeName } from "../../../jacdac-ts/src/azure-iot/dtdl"
import IconButtonWithTooltip from "../../components/ui/IconButtonWithTooltip"
import Snippet from "../../components/ui/Snippet"
import PaperBox from "../../components/ui/PaperBox"
import { useId } from "react-use-id-hook"
import { Link } from "gatsby-theme-material-ui"
import {
    serviceSpecificationToComponent,
    serviceSpecificationToDTDL,
} from "../../../jacdac-ts/src/azure-iot/dtdlspec"

interface TemplateComponent {
    name: string
    service: jdspec.ServiceSpec
}

interface TemplateSpec {
    displayName: string
    components: TemplateComponent[]
}

function ComponentRow(props: {
    twin: TemplateSpec
    component: TemplateComponent
    onUpdate: () => void
}) {
    const { component, onUpdate, twin } = props
    const { name, service } = component
    const { nameError, serviceError } = useMemo(
        () => validateTwinComponent(twin, component),
        [twin, component]
    )
    const nameId = useId()
    const handleComponentNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        component.name = escapeName(ev.target.value)
        onUpdate()
    }
    const handleSetService = (serviceClass: number) => {
        component.service =
            serviceSpecificationFromClassIdentifier(serviceClass)
        onUpdate()
    }
    const handleComponentDelete = () => {
        twin.components.splice(twin.components.indexOf(component), 1)
        onUpdate()
    }
    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        id={nameId}
                        fullWidth={true}
                        error={!!nameError}
                        variant="outlined"
                        label="name"
                        helperText={nameError}
                        value={name}
                        onChange={handleComponentNameChange}
                    />
                </Grid>
                <Grid item>
                    <ServiceSpecificationSelect
                        variant="outlined"
                        label="service"
                        serviceClass={service.classIdentifier}
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

function validateTwinComponent(
    twin: TemplateSpec,
    component: TemplateComponent
) {
    let serviceError: string = undefined
    const nameError: string = undefined
    const count = twin.components.filter(
        c => c.service.classIdentifier === component.service.classIdentifier
    ).length
    if (count > 1) serviceError = `Multiple same service not supported.`
    return { serviceError, nameError }
}

export default function AzureDeviceTemplateDesigner() {
    const variant = "outlined"
    const [twin, setTwin] = useLocalStorage<TemplateSpec>(
        "jacdac:digitaltwin;1",
        {
            displayName: "mydesigner",
            components: [],
        } as TemplateSpec
    )

    const dtdl = {
        "@type": "Interface",
        "@id": `dtmi:jacdac:devices:${escapeName(twin.displayName)};1`,
        displayName: twin.displayName,
        contents: twin.components.map(c =>
            serviceSpecificationToComponent(c.service, c.name)
        ),
        "@context": DTDL_CONTEXT,
    }
    const dtdlSource = JSON.stringify(dtdl, null, 2)

    const update = () => {
        setTwin(clone(twin))
    }
    const handleDisplayNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        twin.displayName = ev.target.value
        update()
    }
    const handleAddService = (service: jdspec.ServiceSpec) => {
        const names = twin.components.map(c => c.name)
        twin.components.push({
            name: uniqueName(names, service.shortId),
            service,
        })
        update()
    }

    return (
        <>
            <h1>Azure Device Template Designer</h1>
            <p>
                An{" "}
                <Link href="https://github.com/Azure/opendigitaltwins-dtdl/">
                    device twin
                </Link>{" "}
                is to be used in Azure IoT Central. The repository of{" "}
                <Link to="/dtmi/">Azure IoT Plug And Play models</Link> for
                services can be used to resolve models.
            </p>

            <Grid container direction="row" spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth={true}
                        label="Display name"
                        placeholder="My device"
                        value={twin.displayName || ""}
                        onChange={handleDisplayNameChange}
                        variant={variant}
                    />
                </Grid>
                {twin.components.map(c => (
                    <ComponentRow
                        key={c.name}
                        twin={twin}
                        component={c}
                        onUpdate={update}
                    />
                ))}
                <Grid item xs={12}>
                    <AddServiceIconButton onAdd={handleAddService} />
                </Grid>
                <Grid item xs={12}>
                    <PaperBox>
                        <Snippet
                            caption={"template"}
                            value={dtdlSource}
                            mode="json"
                            download="model"
                        />
                    </PaperBox>
                </Grid>
                {twin.components?.map(c => (
                    <Grid item xs={12} key={c.name}>
                        <PaperBox>
                            <Snippet
                                caption={c.name}
                                value={JSON.stringify(
                                    serviceSpecificationToDTDL(c.service),
                                    null,
                                    4
                                )}
                                mode="json"
                                download={c.name}
                            />
                        </PaperBox>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}
