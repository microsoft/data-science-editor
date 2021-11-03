import React, { useEffect, useState } from "react"
import { JDClient } from "../../../jacdac-ts/src/jdom/client"
import { CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import useChange from "../../jacdac/useChange"
import { Button, Grid } from "@mui/material"

/**
 * Razor Chroma SDK client
 * Docs: https://assets.razerzone.com/dev_portal/REST/html/index.html
 */
class ChromaClient extends JDClient {
    private connectionInfo: {
        sessionid: string
        uri: string
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private heartbeatInterval: any
    private supported = true

    constructor() {
        super()
        this.mount(() => this.stop())
    }

    get connected() {
        return !!this.connectionInfo
    }

    private startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.unmounted) clearInterval(this.heartbeatInterval)
            this.fetch("/heartbeat", "PUT")
        }, 2000)
    }

    async start() {
        if (!this.supported || this.connected) return

        console.debug("razor: connecting", { conn: this.connectionInfo })
        const resp = await fetch("https://chromasdk.io:54236/razer/chromasdk", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                title: "Microsoft Jacdac",
                description: "Jacdac interface to Razer",
                author: {
                    name: "Microsoft",
                    contact: "jacdac@microsoft.com",
                },
                device_supported: [
                    "keyboard",
                    "mouse",
                    "headset",
                    "mousepad",
                    "keypad",
                    "chromalink",
                ],
                category: "application",
            }),
        })
        console.log({ resp })
        if (this.unmounted) return
        if (resp.status === 200) {
            this.connectionInfo = await resp.json()
            if (this.unmounted) return
            this.startHeartbeat()
            this.emit(CHANGE)
        } else if (resp.status == 404) {
            this.supported = false
            console.log(`razor not supported`)
            this.emit(CHANGE)
        }
    }

    private async stop() {
        console.debug("razor: disconnecting")
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = undefined
        }
        if (this.connectionInfo) {
            const { uri } = this.connectionInfo
            this.connectionInfo = undefined
            try {
                await fetch(uri, {
                    method: "DELETE",
                    headers: { "content-type": "application/json" },
                })
            } catch (e) {
                console.debug(e)
            }
        }
    }

    async startHeadsetEffect(
        effect: "none" | "custom" | "static",
        data: number | [number, number, number, number, number]
    ) {
        let body: unknown
        const ceffect = `CHROMA_${effect.toUpperCase()}`
        if (ceffect === "CHROMA_NONE") {
            body = { effect: ceffect }
        } else if (ceffect === "CHROMA_CUSTOM") {
            body = { effect: ceffect, param: data }
        } else if (ceffect === "CHROMA_STATIC") {
            const color = { color: data }
            body = { effect: ceffect, param: color }
        }
        await this.fetch("/headset", "PUT", body)
    }

    private async fetch(path: string, method: string, body?: unknown) {
        await this.start()
        if (!this.connected) return
        try {
            await fetch(this.connectionInfo.uri + path, {
                method,
                body: body && JSON.stringify(body),
                headers: { "content-type": "application/json" },
            })
        } catch (e) {
            this.connectionInfo = undefined
        }
    }
}

export default function Chroma() {
    const [client] = useState(new ChromaClient())
    const connected = useChange(client, c => c.connected)
    // make sure to cleanup
    useEffect(() => {
        client.start() // async
        return () => client.unmount()
    }, [])

    const handleStatic = (v: number) => async () => {
        await client.startHeadsetEffect("static", v)
    }
    const handleCustom =
        (v: [number, number, number, number, number]) => async () => {
            await client.startHeadsetEffect("custom", v)
        }

    // color: BGR

    return (
        <Grid container spacing={1}>
            <Grid item>
                <div>connected: {connected ? "connected" : "disconnected"}</div>
            </Grid>
            <Grid item>
                <Button onClick={handleStatic(0xff0000)}>headset 255</Button>
                <Button onClick={handleStatic(0x00ff00)}>headset 128</Button>
                <Button onClick={handleStatic(0x0000ff)}>headset 0</Button>
                <Button onClick={handleCustom([0, 64, 128, 196, 255])}>
                    headset custom
                </Button>
            </Grid>
        </Grid>
    )
}
