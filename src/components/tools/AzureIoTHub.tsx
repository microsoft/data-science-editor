import { Link } from "gatsby-theme-material-ui"
import React from "react"
import ApiKeyAccordion from "../ApiKeyAccordion"
import ConnectAlert from "../alert/ConnectAlert"

const AZURE_IOT_HUB_API_KEY = "azureiothubapikey"
const AZURE_IOT_API_VERSION = "2020-05-31-preview"

// https://docs.microsoft.com/en-us/rest/api/iothub/service/devices/createorupdateidentity#device
interface AzureIotHubDevice {
    deviceId: string
    etag: string
    generationId: string
    lastActivityTime?: string
    status: "enabled" | "disabled"
    statusReason: string
    statusUpdateTime: string
}

interface AzureResponse<T> {
    status: number
    success: boolean
    payload?: T
    error?: { code: string; message: string }
}

interface AzureIotHubStats {
    connectedDeviceCount: number
}

interface ConnectionString {
    HostName: string
    source: string
}

function parseConnectionString(source: string): ConnectionString {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r: any = {
        source,
    }
    source
        .split(";")
        .map(fragment => fragment.split("="))
        .forEach(kv => (r[kv[0]] = kv[1]))
    return r["HostName"] && r
}

function ApiKeyManager() {
    const validateKey = async (key: string) => {
        const connectionString = parseConnectionString(key)
        if (!connectionString) {
            return {
                status: 401,
            }
        }
        const stats = await AzureIotHubClient.stats(
            connectionString.source,
            connectionString.HostName
        )
        return stats
    }
    return (
        <ApiKeyAccordion
            title={"Connection string"}
            apiName={AZURE_IOT_HUB_API_KEY}
            validateKey={validateKey}
        >
            Open your Azure IoT Hub in the &nbsp;
            <Link href="https://portal.azure.com/">Azure Portal</Link>, click{" "}
            <code>Shared access policies</code>, select <code>iothubowner</code>
            , copy one of the <code>Connection string—secondary key</code>.
        </ApiKeyAccordion>
    )
}

class AzureIotHubClient {
    // https://docs.microsoft.com/en-us/rest/api/iothub/
    // https://docs.microsoft.com/en-us/rest/api/iothub/common-error-codes
    static async apiFetch<T>(
        sasTokenOrConnectionString: string,
        fullyQualifiedHubName: string,
        path: string | number,
        method?: "GET" | "POST" | "PUT" | "DELETE",
        body?: any
    ): Promise<AzureResponse<T>> {
        const url = `https://${fullyQualifiedHubName}/${path}?api-version=${AZURE_IOT_API_VERSION}`
        const options: RequestInit = {
            method: method || "GET",
            headers: {
                Authorization: sasTokenOrConnectionString,
                Accept: "application/json",
            },
            body: body && JSON.stringify(body),
        }
        if (options.method === "POST" || options.method === "PUT")
            options.headers["Content-Type"] = "application/json"

        const resp = await fetch(url, options)
        const success = resp.status >= 200 && resp.status <= 204
        try {
            const payload = await resp.json()
            return {
                status: resp.status,
                success,
                payload: success && (payload as T),
                error: !success && payload,
            }
        } catch (e) {
            return {
                status: resp.status,
                success: false,
                error: { code: "ClientError", message: e.message },
            }
        }
    }

    // https://docs.microsoft.com/en-us/rest/api/iothub/service/devices/getidentity
    static getIdentity(
        sasTokenOrConnectionString: string,
        fullyQualifiedHubName: string,
        deviceId: string
    ) {
        return this.apiFetch<AzureIotHubDevice>(
            sasTokenOrConnectionString,
            fullyQualifiedHubName,
            `devices/${deviceId}`
        )
    }
    //https://docs.microsoft.com/en-us/rest/api/iothub/service/devices/createorupdateidentity#device
    static createOrUpdateIdentity(
        sasTokenOrConnectionString: string,
        fullyQualifiedHubName: string,
        deviceId: string,
        payload: AzureIotHubDevice
    ) {
        return this.apiFetch<AzureIotHubDevice>(
            sasTokenOrConnectionString,
            fullyQualifiedHubName,
            `devices/${deviceId}`,
            "PUT",
            payload
        )
    }

    // https://docs.microsoft.com/en-us/rest/api/iothub/service/statistics/getservicestatistics
    static stats(
        sasTokenOrConnectionString: string,
        fullyQualifiedHubName: string
    ) {
        return this.apiFetch<AzureIotHubStats>(
            sasTokenOrConnectionString,
            fullyQualifiedHubName,
            `statistics/service`
        )
    }
}

export default function AzureIoTHub() {
    return (
        <>
            <ConnectAlert />
            <ApiKeyManager />
        </>
    )
}
