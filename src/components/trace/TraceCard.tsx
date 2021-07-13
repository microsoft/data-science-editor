import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
} from "@material-ui/core"
import React, { useContext } from "react"
import { prettyDuration } from "../../../jacdac-ts/src/jdom/pretty"
import Trace from "../../../jacdac-ts/src/jdom/trace"
import AppContext, { DrawerType } from "../AppContext"
import Markdown from "../ui/Markdown"
import PacketsContext from "../PacketsContext"

export default function TraceCard(props: { name: string; trace: Trace }) {
    const { name, trace } = props
    const { description, duration, length } = trace
    const { setReplayTrace, toggleTracing } = useContext(PacketsContext)
    const { setDrawerType } = useContext(AppContext)

    const handleClick = () => {
        setDrawerType(DrawerType.Packets)
        setReplayTrace(trace)
        toggleTracing()
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
