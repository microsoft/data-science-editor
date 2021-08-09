import {
    Card,
    CardActions,
    CardContent,
    Grid,
    TextField,
} from "@material-ui/core"
import React, { ChangeEvent, useContext, useMemo, useState } from "react"
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
import { Button, Link } from "gatsby-theme-material-ui"
import {
    serviceSpecificationDTMI,
    serviceSpecificationToComponent,
    serviceSpecificationToDTDL,
} from "../../../jacdac-ts/src/azure-iot/dtdlspec"
import ApiKeyAccordion from "../../components/ApiKeyAccordion"
import GridHeader from "../../components/ui/GridHeader"
import { useSecret } from "../../components/hooks/useSecret"
import Alert from "../../components/ui/Alert"
import AppContext from "../../components/AppContext"
import useDevices from "../../components/hooks/useDevices"
import DeviceCardHeader from "../../components/DeviceCardHeader"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import {
    SRV_BOOTLOADER,
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_ROLE_MANAGER,
} from "../../../jacdac-ts/src/jdom/constants"

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

const AZURE_IOT_CENTRAL_DOMAIN = "azureiotcentraldomain"
const AZURE_IOT_CENTRAL_API_KEY = "azureiotcentraliotkey"
const AZURE_IOT_API_VERSION = "?api-version=1.0"

function ApiKeyManager() {
    const [domain] = useLocalStorage<string>(AZURE_IOT_CENTRAL_DOMAIN)
    const validateKey = async (key: string) => {
        const res = await fetch(
            `${domain}/api/deviceTemplates?api-version=1.0`,
            {
                headers: {
                    authorization: key,
                },
            }
        )
        return res
    }
    return (
        <ApiKeyAccordion
            apiName={AZURE_IOT_CENTRAL_API_KEY}
            title="API token"
            validateKey={validateKey}
        >
            Open <strong>Administration</strong>,{" "}
            <strong>
                {domain ? (
                    <Link target="_blank" href={`${domain}admin/tokens`}>
                        API tokens
                    </Link>
                ) : (
                    "API tokens"
                )}
            </strong>
            , create a new Token and copy the value here.
        </ApiKeyAccordion>
    )
}

function twinToDTDL(twin: TemplateSpec, merged: boolean) {
    const dtdl = {
        "@type": "Interface",
        "@id": `dtmi:jacdac:device:${escapeName(twin.displayName)};1`,
        displayName: twin.displayName,
        contents: [],
        "@context": DTDL_CONTEXT,
    }
    if (merged) {
        twin.components.forEach(({ name, service }) => {
            const srvDTDL = serviceSpecificationToDTDL(service)
            srvDTDL.contents.forEach(ctn => {
                ctn.name = `${name}${ctn.name}`
            })
            dtdl.contents = [...dtdl.contents, srvDTDL.contents]
        })
    } else {
        dtdl.contents = [
            ...dtdl.contents,
            ...twin.components.map(c =>
                serviceSpecificationToComponent(c.service, c.name)
            ),
        ]
    }

    return dtdl
}

const ignoredServices = [
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_ROLE_MANAGER,
    SRV_PROTO_TEST,
    SRV_BOOTLOADER,
]
export default function AzureDeviceTemplateDesigner() {
    const variant = "outlined"
    const merged = true
    const domainId = useId()
    const devices = useDevices({ ignoreSelf: true, announced: true })
    const { enqueueSnackbar, setError } = useContext(AppContext)
    const [domain, setDomain] = useLocalStorage<string>(
        AZURE_IOT_CENTRAL_DOMAIN,
        ""
    )
    const { value: apiToken } = useSecret(AZURE_IOT_CENTRAL_API_KEY)
    const [twin, setTwin] = useLocalStorage<TemplateSpec>(
        "jacdac:digitaltwin;1",
        {
            displayName: "mydesigner",
            components: [],
        } as TemplateSpec
    )
    const [apiWorking, setApiWorking] = useState(false)
    const [apiError, setApiError] = useState("")

    const dtdl = twinToDTDL(twin, merged)
    const dtdlSource = JSON.stringify(dtdl, null, 2)

    const handleDomainChange = (ev: ChangeEvent<HTMLInputElement>) =>
        setDomain(ev.target.value)
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

    const apiFetch = async (
        method: "GET" | "POST" | "PATCH" | "PUT",
        path: string,
        // eslint-disable-next-line @typescript-eslint/ban-types
        body?: object
    ) => {
        const url = `${domain}api/${path}${AZURE_IOT_API_VERSION}`
        const options: RequestInit = {
            method,
            headers: {
                authorization: apiToken,
                Accept: "application/json",
            },
            body: body && JSON.stringify(body),
        }
        if (
            options.method === "POST" ||
            options.method === "PUT" ||
            options.method === "PATCH"
        )
            options.headers["Content-Type"] = "application/json"
        const res = await fetch(url, options)
        return res
    }

    const uploadTemplate = async (
        dtmi: string,
        displayName: string,
        // eslint-disable-next-line @typescript-eslint/ban-types
        capabilityModel: object
    ) => {
        try {
            setApiWorking(true)
            setApiError("")
            setError("")
            const path = `deviceTemplates/${dtmi}`
            const current = await apiFetch("GET", path)
            const exists = current.status === 200
            console.log(
                `iotc: template ${dtmi} ${exists ? "exists" : "missing"}`
            )
            const body = {
                "@type": ["ModelDefinition", "DeviceModel"],
                displayName,
                capabilityModel,
            }
            const res = await apiFetch(exists ? "PATCH" : "PUT", path, body)
            const success = res.status === 200
            const resj = await res.json()
            console.log(`iotc: upload template ${res.status}`, {
                resj,
                body,
            })
            if (!success) {
                setApiError(resj.error?.message)
                setError(resj.error?.message)
            } else {
                enqueueSnackbar("Device imported!")
            }
        } finally {
            setApiWorking(false)
        }
    }

    const handleUploadModel = async () => {
        await uploadTemplate(
            `dtmi:jacdac:devicemodel:${escapeName(twin.displayName)};1`,
            twin.displayName,
            dtdl
        )
    }
    const handleUploadTemplate = (template: TemplateComponent) => async () => {
        const { service } = template
        const { shortId } = service
        const dtmi = serviceSpecificationDTMI(service, "servicemodel")
        const capabilityModel = serviceSpecificationToDTDL(service)
        await uploadTemplate(dtmi, shortId, capabilityModel)
    }

    const handleSelectDevice = (device: JDDevice) => async () => {
        const services = device
            .services()
            .filter(srv => ignoredServices.indexOf(srv.serviceClass) < 0)
        await Promise.all(services.map(srv => srv.resolveInstanceName()))
        const newTwin: TemplateSpec = {
            displayName: twin.displayName,
            components: services.map(service => ({
                name: service.instanceName,
                service: service.specification,
            })),
        }
        setTwin(newTwin)
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
                <GridHeader title="Connection" />
                <Grid item xs={12}>
                    <TextField
                        id={domainId}
                        value={domain}
                        fullWidth={true}
                        variant="outlined"
                        onChange={handleDomainChange}
                        helperText="Azure IoT Central domain"
                        placeholder="https://.....azureiotcentral.com/"
                    />
                </Grid>
                <Grid item xs={12}>
                    <ApiKeyManager />
                </Grid>
                <GridHeader title="Devices" />
                {devices.map(device => (
                    <Grid key={device.id} item xs={4}>
                        <Card>
                            <DeviceCardHeader
                                device={device}
                                showAvatar={true}
                            />
                            <CardContent>
                                {device
                                    .services()
                                    .filter(
                                        srv =>
                                            ignoredServices.indexOf(
                                                srv.serviceClass
                                            ) < 0
                                    )
                                    .map(srv => srv.name).join(", ")}
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="outlined"
                                    onClick={handleSelectDevice(device)}
                                >
                                    import services
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                <GridHeader title="Model" />
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
                {apiError && (
                    <Grid item xs={12}>
                        <Alert severity="error">{apiError}</Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <PaperBox>
                        <Snippet
                            caption={"template"}
                            value={dtdlSource}
                            mode="json"
                            actions={
                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={
                                        apiWorking || !domain || !apiToken
                                    }
                                    onClick={handleUploadModel}
                                    title="Import the device template into your Azure IoT Central application (requires domain and API token)."
                                >
                                    Import template
                                </Button>
                            }
                        />
                    </PaperBox>
                </Grid>
                {!merged &&
                    twin.components?.map(c => (
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
                                    actions={
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            disabled={!domain || !apiToken}
                                            onClick={handleUploadTemplate(c)}
                                            title="Import the service template into your Azure IoT Central application (requires domain and API token)."
                                        >
                                            Import template
                                        </Button>
                                    }
                                />
                            </PaperBox>
                        </Grid>
                    ))}
            </Grid>
        </>
    )
}
