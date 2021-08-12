import { Grid, TextField, Link } from "@material-ui/core"
import React, { ChangeEvent, useState } from "react"
import useLocalStorage from "../../components/hooks/useLocalStorage"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import { DTDLNode, DTDLSchema } from "../../../jacdac-ts/src/azure-iot/dtdl"
import { useId } from "react-use-id-hook"
import { Button } from "gatsby-theme-material-ui"
import ApiKeyAccordion from "../../components/ApiKeyAccordion"
import { useSecret } from "../../components/hooks/useSecret"
import Alert from "../../components/ui/Alert"
import {
    serviceSpecificationDTMI,
    serviceSpecificationsWithDTDL,
    serviceSpecificationToDTDL,
    toDTMI,
} from "../../../jacdac-ts/src/azure-iot/dtdlspec"
import useMounted from "../../components/hooks/useMounted"
import { isSensor } from "../../../jacdac-ts/src/jdom/spec"

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
            defaultExpanded={true}
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

export default function AzureDeviceTemplateDesigner() {
    const domainId = useId()
    const [domain, setDomain] = useLocalStorage<string>(
        AZURE_IOT_CENTRAL_DOMAIN,
        ""
    )
    const { value: apiToken } = useSecret(AZURE_IOT_CENTRAL_API_KEY)
    const [working, setWorking] = useState(false)
    const [error, setError] = useState("")
    const [output, setOutput] = useState("")
    const mounted = useMounted()

    const handleDomainChange = (ev: ChangeEvent<HTMLInputElement>) =>
        setDomain(ev.target.value)

    const apiPutTemplate = async (
        dtmi: string,
        type: string,
        dtdl: DTDLNode
    ) => {
        const path = `deviceTemplates/${dtmi}`
        const url = `${domain}api/${path}${AZURE_IOT_API_VERSION}`
        const body = {
            "@type": ["ModelDefinition", type],
            displayName: dtdl.displayName,
            capabilityModel: dtdl,
            contents: [dtdl],
        }
        const options: RequestInit = {
            method: "PUT",
            headers: {
                authorization: apiToken,
                Accept: "application/json",
            },
            body: JSON.stringify(body),
        }
        if (
            options.method === "POST" ||
            options.method === "PUT" ||
            options.method === "PATCH"
        )
            options.headers["Content-Type"] = "application/json"
        const res = await fetch(url, options)
        const status = res.status
        const success = status === 200
        const response = await res.json()

        console.debug(
            `${dtdl.displayName} (${dtmi}) upload ${
                success ? "success" : "error"
            } (${status}) `,
            { status, body: JSON.stringify(body), response }
        )

        return {
            status,
            success,
            response,
        }
    }

    const handleUpload = async () => {
        const specifications = serviceSpecificationsWithDTDL().filter(spec =>
            isSensor(spec)
        )
        try {
            setWorking(true)
            setError("")
            setOutput("")
            {
                const { success } = await apiPutTemplate(
                    toDTMI(["template", "device"]),
                    "GatewayModel",
                    {
                        "@id": toDTMI(["device"]),
                        "@type": "Interface",
                        contents: [
                            {
                                "@id": toDTMI(["sensor"]),
                                "@type": ["Relationship", "GatewayDevice"],
                                displayName: "sensor",
                                name: "sensor",
                                target: [],
                            },
                        ],
                        displayName: "device",
                        "@context": [
                            "dtmi:iotcentral:context;2",
                            "dtmi:dtdl:context;2",
                        ],
                    } as DTDLSchema
                )
                if (!success) return
            }

            // upload services
            for (const spec of specifications) {
                const dtmi = serviceSpecificationDTMI(spec, "template")
                const dtdl = serviceSpecificationToDTDL(spec)
                const { success } = await apiPutTemplate(
                    dtmi,
                    "DeviceModel",
                    dtdl
                )
                if (!success) return
            }

            setOutput("All services added successfully!")
        } catch (e) {
            if (mounted()) {
                setError(e.message)
                console.debug(e)
            }
        } finally {
            if (mounted()) setWorking(false)
        }
    }

    return (
        <>
            <h1>Azure Device Templates</h1>
            <p>
                This page import device templates into your Azure IoT Central
                application.
            </p>
            <Grid container direction="row" spacing={2}>
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
                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error">{error}</Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Grid container spacing={1}>
                        <Grid item>
                            {" "}
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={working || !domain || !apiToken}
                                onClick={handleUpload}
                                title="Import the device template into your Azure IoT Central application (requires domain and API token)."
                            >
                                Upload device templates
                            </Button>
                        </Grid>
                        {domain && (
                            <Grid item>
                                <Link
                                    variant="caption"
                                    href={`${domain}device-templates`}
                                    target={"_blank"}
                                >
                                    Open device templates
                                </Link>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
                {output && (
                    <Grid item xs={12}>
                        <Alert severity="success">{output}</Alert>
                    </Grid>
                )}
            </Grid>
        </>
    )
}
