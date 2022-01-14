import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
} from "@mui/material"
import React, { useContext } from "react"
import { prettyDuration } from "../../../jacdac-ts/src/jdom/pretty"
import { Trace } from "../../../jacdac-ts/src/jdom/trace/trace"
import Markdown from "../ui/Markdown"
import PacketsContext from "../PacketsContext"
import { navigate } from "gatsby"

export default function TraceCard(props: { name: string; trace: Trace }) {
    const { name, trace } = props
    const { description, duration, length } = trace
    const { setReplayTrace } = useContext(PacketsContext)

    const handleClick = () => {
        setReplayTrace(trace)
        navigate("/tools/player");
    }

    return (
        <Card>
            <CardHeader
                title={name}
                subheader={`${prettyDuration(duration)}, ${length} packets`}
            />
            <CardContent>
                {description && <Markdown source={description} />}
            </CardContent>
            <CardActions>
                <Button onClick={handleClick} variant="outlined">
                    import
                </Button>
            </CardActions>
        </Card>
    )
}
