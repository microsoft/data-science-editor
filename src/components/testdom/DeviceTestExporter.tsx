import { Grid, TextField, Typography } from "@mui/material"
import React, { ChangeEvent, useEffect } from "react"
import useLocalStorage from "../hooks/useLocalStorage"
import {
    DEVICE_TEST_KIND,
    TestNode,
} from "../../../jacdac-ts/src/testdom/nodes"
import { useId } from "react"
import { STATE_CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { TestState, TestUploadState } from "../../../jacdac-ts/src/testdom/spec"
import { getStorageItem } from "../hooks/useStorage"
import HighlightTextField from "../ui/HighlightTextField"
import { JSONTryParse } from "../../../jacdac-ts/src/jdom/utils"

const PANEL_UPLOAD_URL = "device-tester-post-url"
const PANEL_UPLOAD_AUTH = "device-tester-post-auth"
const PANEL_UPLOAD_CUSTOM = "device-tester-post-custom"

export function useDeviceTestExporter(test: TestNode) {
    const serialize = (node: TestNode) => {
        const repo = process.env.GATSBY_GITHUB_REPOSITORY
        const sha = process.env.GATSBY_GITHUB_SHA
        const r: any = node.export()
        if (repo && sha) r.jacdac = { host: window.location?.host, repo, sha }
        return r
    }

    const handlePost = async (node: TestNode) => {
        const url = getStorageItem<string>(
            window.localStorage,
            PANEL_UPLOAD_URL
        )
        const token = getStorageItem<string>(
            window.localStorage,
            PANEL_UPLOAD_AUTH
        )
        const custom = getStorageItem<string>(
            window.localStorage,
            PANEL_UPLOAD_CUSTOM
        )

        if (!url) return
        try {
            node.uploadState = TestUploadState.Uploading
            const body = serialize(node)
            if (custom) body.custom = JSONTryParse(custom)
            console.debug(
                `test upload: post result of ${node.id} to ${url}`,
                body,
                url
            )
            const init: RequestInit = {
                headers: {
                    "content-type": "application/json",
                    authorization: token,
                },
                method: "post",
                body: JSON.stringify(body),
            }
            const res = await fetch(url, init)
            console.debug(`test upload: ${res.status}`, res)
            if (res.status === 200) node.uploadState = TestUploadState.Uploaded
            else node.uploadState = TestUploadState.UploadError
        } catch (e) {
            node.uploadState = TestUploadState.UploadError
        }
    }
    useEffect(() => {
        if (!test || !test.factory) return
        const unsubs = []
        const visit = (n: TestNode) => {
            if (n.nodeKind === DEVICE_TEST_KIND)
                unsubs.push(
                    n.subscribe(STATE_CHANGE, () => {
                        if (
                            n.uploadState == TestUploadState.Local &&
                            (n.state === TestState.Fail ||
                                n.state === TestState.Pass)
                        )
                            handlePost(n)
                    })
                )
            n.children?.forEach(visit)
        }
        visit(test)
        return () => unsubs.forEach(u => u())
    }, [test, test?.factory])
}

export default function DeviceTestExporter() {
    const urlId = useId()
    const tokenId = urlId + "-token"
    const [url, setUrl] = useLocalStorage<string>(PANEL_UPLOAD_URL, "")
    const [token, setToken] = useLocalStorage<string>(PANEL_UPLOAD_AUTH, "")
    const [custom, setCustom] = useLocalStorage<string>(PANEL_UPLOAD_CUSTOM, "")
    const urlError =
        !!url && !/https?:\/\//i.test(url)
            ? "URL must start with https://"
            : undefined

    const handleUrlChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setUrl(ev.target.value?.trim() || "")
    }
    const handleTokenChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setToken(ev.target.value)
    }

    return (
        <Grid sx={{ mt: 0.5 }} container spacing={1}>
            <Grid item xs>
                <TextField
                    id={urlId}
                    label={"Upload url"}
                    value={url}
                    size="small"
                    onChange={handleUrlChange}
                    fullWidth={true}
                    helperText={
                        urlError ||
                        "URL to POST test result as JSON once failed or passed."
                    }
                    error={!!urlError}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={tokenId}
                    label={"Authorization header"}
                    value={token}
                    size="small"
                    onChange={handleTokenChange}
                    helperText={
                        "Optional Authorization header content (i.e. token)"
                    }
                />
            </Grid>
            <Grid item xs={12}>
                <HighlightTextField
                    code={custom}
                    language="json"
                    onChange={setCustom}
                    minHeight="5em"
                />
                <Typography variant="caption">
                    Custom JSON to be added to the result upload. 
                </Typography>
            </Grid>
        </Grid>
    )
}
