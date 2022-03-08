import { Grid, TextField } from "@mui/material"
import React, { ChangeEvent, useState } from "react"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import { PanelTest } from "../../../jacdac-ts/src/testdom/nodes"
import CopyButton from "../../components/ui/CopyButton"
import { delay } from "../../../jacdac-ts/src/jdom/utils"
import { useId } from "react-use-id-hook"
import { Button } from "gatsby-theme-material-ui"
import useSnackbar from "../../components/hooks/useSnackbar"

const PANEL_UPLOAD_URL = "panel-test-post-url"

export default function PanelTestExport(props: { panel: PanelTest }) {
    const { panel } = props
    const urlId = useId()
    const tokenId = useId()
    const [url, setUrl] = useLocalStorage(PANEL_UPLOAD_URL, "")
    const [token, setToken] = useState("")
    const [posting, setPosting] = useState(false)
    const { setError, enqueueSnackbar } = useSnackbar()
    const urlError = !!url && !/https?:\/\//i.test(url)

    const serialize = async () => {
        const repo = process.env.GATSBY_GITHUB_REPOSITORY
        const sha = process.env.GATSBY_GITHUB_SHA
        panel.deviceTests
            .map(d => d.device)
            .filter(d => !!d)
            .forEach(d => d.refreshFirmwareInfo())
        await delay(500)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r: any = panel.export()
        if (repo && sha) r.jacdac = { repo, sha }
        return JSON.stringify(r, null, 2)
    }

    const handleUrlChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setUrl(ev.target.value?.trim() || "")
    }
    const handleTokenChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setToken(ev.target.value)
    }

    const handlePost = async () => {
        try {
            setPosting(true)
            const body = await serialize()
            const req: any = {
                headers: {
                    "content-type": "application/json",
                },
                method: "post",
                url,
                body,
            }
            if (token) req.headers.authorization = token
            const res = await fetch(req)
            if (res.status === 200) enqueueSnackbar(`results posted`)
            else setError(`error while posting results (status ${res.status})`)
        } catch (e) {
            setError(e)
        } finally {
            setPosting(false)
        }
    }

    return (
        <>
            <h3>
                Export Test Results{" "}
                <CopyButton
                    variant="outlined"
                    onCopy={serialize}
                    title="export to clipboard"
                    disabled={!panel}
                />
            </h3>
            <Grid container spacing={1}>
                <Grid item>
                    <TextField
                        id={urlId}
                        label={"Upload url"}
                        value={url}
                        size="small"
                        onChange={handleUrlChange}
                        helperText={
                            urlError ||
                            "Url to an POST web api that receives the results as a JSON payload"
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
                <Grid item>
                    <Button
                        aria-label="Post test results to a user provided API url"
                        disabled={!panel || !url || !!urlError || posting}
                        variant="outlined"
                        onClick={handlePost}
                    >
                        Post
                    </Button>
                </Grid>
            </Grid>
        </>
    )
}
