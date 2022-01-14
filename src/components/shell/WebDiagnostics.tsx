import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material"
import React, { useContext, useState } from "react"
import {
    NEW_LISTENER,
    REMOVE_LISTENER,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDNode } from "../../../jacdac-ts/src/jdom/node"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import PaperBox from "../ui/PaperBox"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Alert from "../ui/Alert"
import { AlertTitle } from "@mui/material"

function visitNodes(node: JDNode, vis: (node: JDNode) => void) {
    const todo = [node]
    while (todo.length) {
        const node = todo.pop()
        vis(node)
        node.children.forEach(child => todo.push(child))
    }
}

function NodeCallRow(props: { node: JDNode }) {
    const { node } = props
    const emitStats = node.eventStats
    const newListenerStats = node.newListenerStats || {}
    const events = Object.keys(emitStats)
        .filter(ev => emitStats[ev] || newListenerStats[ev])
        .sort((l, r) => -emitStats[l] + emitStats[r])
    const emitTotal = events
        .filter(ev => ev !== REMOVE_LISTENER && ev !== NEW_LISTENER)
        .map(ev => emitStats[ev] | 0)
        .reduce((prev, curr) => prev + curr, 0)
    const newListenerTotal = events
        .map(ev => newListenerStats[ev] | 0)
        .reduce((prev, curr) => prev + curr, 0)

    if (emitTotal == 0) return null

    return (
        <>
            <TableHead>
                <TableRow>
                    <TableCell>{node.id}</TableCell>
                    <TableCell>{emitTotal}</TableCell>
                    <TableCell>{newListenerTotal}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {events.map(ev => (
                    <TableRow key={`event:${ev}`}>
                        <TableCell>{ev}</TableCell>
                        <TableCell>{emitStats[ev] || 0}</TableCell>
                        <TableCell>{newListenerStats[ev] || 0}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </>
    )
}

function NodeCalls() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const nodes: Record<string, JDNode> = {}
    visitNodes(bus, n => (nodes[n.id] = n))

    return (
        <PaperBox key="slots">
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>node</TableCell>
                            <TableCell>calls</TableCell>
                            <TableCell>new listener</TableCell>
                        </TableRow>
                    </TableHead>
                    {Object.values(nodes).map(node => (
                        <NodeCallRow key={`calls:${node.id}`} node={node} />
                    ))}
                </Table>
            </TableContainer>
        </PaperBox>
    )
}

function NodeListenerRow(props: { node: JDNode }) {
    const { node } = props
    const eventNames = node
        .eventNames()
        .filter(ev => node.listenerCount(ev))
        .sort((l, r) => -node.listenerCount(l) + node.listenerCount(r))
    const counts = eventNames.map(ev => node.listenerCount(ev))
    const total = counts.reduce((p, c) => p + c, 0)

    const handleClick = (ev: string) => () => {
        const stackTraces = node.listenerStackTraces(ev)
        stackTraces.forEach(st => console.log(st))
    }

    if (total == 0) return null

    return (
        <>
            <TableHead>
                <TableRow>
                    <TableCell valign="top">{node.id}</TableCell>
                    <TableCell valign="top">{total}</TableCell>
                    <TableCell />
                </TableRow>
            </TableHead>
            <TableBody>
                {eventNames.map((ev, i) => (
                    <TableRow key={`listener:${ev}`}>
                        <TableCell>{ev}</TableCell>
                        <TableCell>{counts[i]}</TableCell>
                        <TableCell>
                            <Button size="small" onClick={handleClick(ev)}>
                                traces
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </>
    )
}

function NodeListeners() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const nodes: Record<string, JDNode> = {}
    visitNodes(bus, n => (nodes[n.id] = n))

    return (
        <PaperBox key="slots">
            <TableContainer>
                <Table size="small">
                    {Object.values(nodes).map(node => (
                        <NodeListenerRow key={`node:${node.id}`} node={node} />
                    ))}
                </Table>
            </TableContainer>
        </PaperBox>
    )
}

export default function WebDiagnostics() {
    const [expanded, setExpanded] = React.useState<string | false>(false)
    const [v, setV] = useState(0)
    const handleRefresh = () => {
        setV(v + 1)
    }

    const handleChange =
        (panel: string) =>
        (event: React.ChangeEvent<unknown>, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false)
        }

    return (
        <Alert severity="info">
            <AlertTitle>
                Diagnostics{" "}
                <Button variant="outlined" onClick={handleRefresh}>
                    refresh
                </Button>
            </AlertTitle>
            <p>
                This diagnostics view does not register events to refresh
                automatically. Click the button above to refresh data.
            </p>
            <Accordion
                expanded={expanded === "listeners"}
                onChange={handleChange("listeners")}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Event Listeners
                </AccordionSummary>
                <AccordionDetails>
                    <NodeListeners />
                </AccordionDetails>
            </Accordion>
            <Accordion
                expanded={expanded === "calls"}
                onChange={handleChange("calls")}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Event Calls
                </AccordionSummary>
                <AccordionDetails>
                    <NodeCalls />
                </AccordionDetails>
            </Accordion>
        </Alert>
    )
}
