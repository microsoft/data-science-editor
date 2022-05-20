import { Button, Grid, Typography } from "@mui/material"
import { JSONTryParse } from "../../../../jacdac-ts/src/jdom/utils"
import React, { useState } from "react"
import {
    CommandOptions,
    useCommandPalette,
} from "../../../components/commands/CommandPaletteContext"
import HighlightTextField from "../../../components/ui/HighlightTextField"
import Markdown from "../../../components/ui/Markdown"

function CommandHelp(props: { command: CommandOptions }) {
    const { command } = props
    const { id, description, help } = command
    const md = help?.()
    return (
        <>
            <h3>
                <code>{id}</code>
            </h3>
            <Typography variant="body1">{description}</Typography>
            {!!md && <Markdown source={md} />}
        </>
    )
}

function CommandTester() {
    const [source, setSource] = useState(`{
    "type": "jacdac-command",
    "command": "simulator.start",
    "args": {
        "name": "button"
    }
}`)
    const json = JSONTryParse(source)

    const handleClick = () => {
        window.postMessage(json)
    }

    return (
        <Grid spacing={1} container direction="row">
            <Grid item xs={12}>
                <HighlightTextField
                    code={source}
                    language="json"
                    onChange={setSource}
                />
            </Grid>
            <Grid item>
                <Button
                    variant="contained"
                    onClick={handleClick}
                    disabled={!json}
                >
                    Post Message
                </Button>
            </Grid>
        </Grid>
    )
}

export default function Page() {
    const { commands } = useCommandPalette()
    return (
        <>
            <h1>Command helper</h1>
            <p>
                The Jacdac interface can be driven using the following commands
                through Window <code>postMessage</code>.
            </p>
            <p>The message structure is as follow.</p>
            <pre>
                <code>
                    {`interface Command {
    type: "jacdac-command"
    // message id
    id?: string
    // command id
    command: unknown
    // optional command arguments
    args?: unknown
}`}
                </code>
            </pre>
            <p>
                Note that if the message has an `id` (unique identifier for the
                message), Jacdac will respond a message with the result.
            </p>
            <pre>
                <code>
                    {`interface CommandResponse extends Command {
    result: "success" : "error"
    error?: unknown
}`}
                </code>
            </pre>
            <h2>Commands</h2>
            {commands?.map(command => (
                <CommandHelp key={command.id} command={command} />
            ))}
            <h2>Command Tester</h2>
            <p>
                Test commands by posting a message to the current window. Open
                the JavaScript console for debugging messages.
            </p>
            <CommandTester />
        </>
    )
}
