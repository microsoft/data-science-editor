import React, { useEffect, useMemo, useState } from "react"
import { Octokit } from "@octokit/core"
import { createPullRequest } from "octokit-plugin-create-pull-request/pkg"
import { Button, Link } from "gatsby-theme-material-ui"
import {
    AlertTitle,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    TextField,
} from "@mui/material"
import GitHubIcon from "@mui/icons-material/GitHub"
import ApiKeyAccordion from "../ApiKeyAccordion"
import { useId } from "react"
import LoadingProgress from "../ui/LoadingProgress"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import { anyRandomUint32 } from "../../../jacdac-ts/src/jdom/random"
import useSnackbar from "../hooks/useSnackbar"
import useAnalytics from "../hooks/useAnalytics"
import useSessionStorage from "../hooks/useSessionStorage"
import Alert from "../ui/Alert"

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
    const [response, setResponse] = useState<{
        number: number
        html_url: string
    }>(undefined)
    const [busy, setBusy] = useState(false)
    const { trackEvent } = useAnalytics()
    const [githubToken, setGithubToken] = useSessionStorage("githubtoken")
    const { setError: setAppError, enqueueSnackbar } = useSnackbar()
    const [confirmDialog, setConfirmDialog] = useState(false)
    const bodyId = useId()
    const [body, setBody] = useState(description)

    const prUrl = response?.html_url
    const prId = response?.number
    const disabled =
        busy || !body || !title || !head || !files || !Object.keys(files).length

    // clear PR id if files change
    useEffect(() => {
        setResponse(undefined)
    }, [JSON.stringify(files)])

    const handleOpenConfirm = () => setConfirmDialog(true)
    const handleCloseConfirm = () => setConfirmDialog(false)
    const handleBodyChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
        setBody(ev.target.value)

    const handleCreatePullRequest = async () => {
        const headSuffix = toHex(anyRandomUint32(2))
        enqueueSnackbar("creating pull request...")
        setBusy(true)
        setConfirmDialog(false)
        setResponse(undefined)
        try {
            trackEvent("github.pullrequest.start")
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
                        commit: title,
                    },
                ],
            })
            console.debug(`request status ${result.status}`)
            trackEvent("github.pullrequest.status", { status: result.status })
            if (result.status === 201) {
                setResponse(result.data)
            } else {
                setResponse(undefined)
            }
        } catch (e) {
            trackEvent("github.pullrequest.error")
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
                {prId !== undefined && (
                    <Grid item xs={12}>
                        <Alert severity="success">
                            <AlertTitle>
                                Pull Request{" "}
                                <Link
                                    target="_blank"
                                    rel="no-referrer no-follower"
                                    href={prUrl}
                                >
                                    #{prId}
                                </Link>{" "}
                                created
                            </AlertTitle>
                            The Jacdac team will review your submission and
                            contact you for further details. If you need to edit
                            or add comments, open the{" "}
                            <Link
                                target="_blank"
                                rel="no-referrer no-follower"
                                href={prUrl}
                            >
                                pull request on GitHub
                            </Link>{" "}
                            and post them there.
                        </Alert>
                    </Grid>
                )}
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
                        and generate a new personal access token with{" "}
                        <b>
                            <code>repo</code>
                        </b>
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
