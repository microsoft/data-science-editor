import React, { useContext, useMemo, useState } from "react"
import { Octokit } from "@octokit/core"
import { createPullRequest } from "octokit-plugin-create-pull-request"
import { Button, Link } from "gatsby-theme-material-ui"
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    TextField,
    Typography,
} from "@mui/material"
import { GITHUB_API_KEY } from "../github"
import AppContext from "../AppContext"
import GitHubIcon from "@mui/icons-material/GitHub"
import ApiKeyAccordion from "../ApiKeyAccordion"
import { useId } from "react-use-id-hook"
import LoadingProgress from "../ui/LoadingProgress"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import { anyRandomUint32 } from "../../../jacdac-ts/src/jdom/random"

export type GithubPullRequestFiles = Record<
    string,
    string | { content: string; encoding: "utf-8" | "base64" }
>

export interface GithubPullRequestButtonProps {
    title: string
    label?: string
    description?: string
    head: string
    files: GithubPullRequestFiles
}

export default function GithubPullRequestButton(
    props: GithubPullRequestButtonProps
) {
    const {
        files,
        label = "Create Pull Request",
        title,
        description,
        head,
    } = props
    const [, setResponse] = useState(undefined)
    const [busy, setBusy] = useState(false)
    const [githubToken, setGithubToken] = useState("")
    const { setError: setAppError, enqueueSnackbar } = useContext(AppContext)
    const [confirmDialog, setConfirmDialog] = useState(false)
    const bodyId = useId()
    const [body, setBody] = useState(description)
    const headSuffix = useMemo(() => toHex(anyRandomUint32(2)), [])

    const disabled =
        busy || !body || !title || !head || !files || !Object.keys(files).length

    const handleOpenConfirm = () => setConfirmDialog(true)
    const handleCloseConfirm = () => setConfirmDialog(false)
    const handleBodyChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
        setBody(ev.target.value)

    const handleCreatePullRequest = async () => {
        enqueueSnackbar("creating pull request...")
        setBusy(true)
        setConfirmDialog(false)
        try {
            const MyOctokit = Octokit.plugin(createPullRequest)
            const octokit = new MyOctokit({
                auth: githubToken,
            })

            // Returns a normal Octokit PR response
            // See https://octokit.github.io/rest.js/#octokit-routes-pulls-create
            const result = await octokit.createPullRequest({
                owner: "microsoft",
                repo: "jacdac",
                title,
                body,
                head: head + "/" + headSuffix,
                changes: [
                    {
                        files,
                        commit: `added files`,
                    },
                ],
            })

            if (result.status === 201) {
                setResponse(result.data)
                const url = result.data.html_url
                const id = result.data.number
                enqueueSnackbar(
                    <Typography component="span">
                        Pull Request{" "}
                        <Link
                            target="_blank"
                            rel="no-referrer no-follower"
                            href={url}
                        >
                            #{id}
                        </Link>{" "}
                        created...
                    </Typography>,
                    "success"
                )
            } else {
                setResponse(undefined)
            }
        } catch (e) {
            setAppError(e)
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <Grid container spacing={1} direction="row">
                {!description && (
                    <Grid item xs={12}>
                        <TextField
                            id={bodyId}
                            label="message"
                            aria-label="Description of the changes"
                            placeholder="Describe your changes"
                            fullWidth={true}
                            value={body}
                            onChange={handleBodyChange}
                        />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Button
                        disabled={disabled}
                        color="primary"
                        variant="contained"
                        onClick={handleOpenConfirm}
                        startIcon={busy ? <LoadingProgress /> : <GitHubIcon />}
                    >
                        {label}
                    </Button>
                </Grid>
            </Grid>
            <Dialog open={confirmDialog} onClose={handleCloseConfirm}>
                <DialogContent>
                    <DialogContentText>
                        We will open a new Pull Request in{" "}
                        <Link
                            href="https://github.com/microsoft/jacdac"
                            rel="noreferrer nofollower"
                        >
                            microsoft/jacdac
                        </Link>{" "}
                        with your files. If needed, we will fork{" "}
                        <code>microsoft/jacdac</code> under your account and
                        create a Pull Request in that repository.
                    </DialogContentText>
                    <ApiKeyAccordion
                        title="GitHub Developer Token"
                        apiKey={githubToken}
                        setApiKey={setGithubToken}
                    >
                        Open{" "}
                        <Link
                            target="_blank"
                            href="https://github.com/settings/tokens/new"
                            rel="noreferrer nofollower"
                        >
                            https://github.com/settings/tokens/new
                        </Link>{" "}
                        and generate a new personal access token with **repo**
                        scope.
                    </ApiKeyAccordion>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreatePullRequest}
                        disabled={disabled || !githubToken}
                        aria-label="create pull request"
                    >
                        create pull request
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
