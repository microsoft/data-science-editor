import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    Typography,
} from "@mui/material"
import React, { ChangeEvent, useContext, useState } from "react"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"
import { Button, Link } from "gatsby-theme-material-ui"
import PeerJSBridge, { PeerConnection } from "./peerjsbridge"
import GridHeader from "../ui/GridHeader"
import Alert from "../ui/Alert"
import { UIFlags } from "../../jacdac/providerbus"
import LoadingProgress from "../ui/LoadingProgress"

function PeerItem(props: { peer: PeerJSBridge }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { peer } = props
    const id = useChange(peer, _ => _?.id)

    const handleStop = () => {
        peer.bus = undefined
    }

    const handleStart = () => {
        const p = new PeerJSBridge()
        p.bus = bus
    }

    return (
        <Grid item xs={12}>
            <Card>
                <CardContent>
                    <Typography>
                        Connect to be able join other Jacdac networks.
                    </Typography>
                    {id && (
                        <TextField
                            value={id}
                            disabled={true}
                            fullWidth={true}
                            type="text"
                            label="peer identifier"
                        />
                    )}
                </CardContent>
                <CardActions>
                    {!id ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleStart}
                        >
                            connect
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleStop}>
                            disconnect
                        </Button>
                    )}
                </CardActions>
            </Card>
        </Grid>
    )
}

function ConnectItem(props: { peer: PeerJSBridge }) {
    const { peer } = props
    const disconnected = !peer
    const { id: myid } = useChange(peer, _ => _)
    const [id, setId] = useState("")

    const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setId(ev.target.value)
    }
    const handleConnect = () => {
        peer.connect(id)
    }

    return (
        <Grid item xs={12} sm={6}>
            <Card>
                <CardContent>
                    <TextField
                        value={id}
                        onChange={handleChange}
                        fullWidth
                        type="text"
                        label="Peer identifier"
                        helperText="Copy the remote connection identifier"
                    />
                </CardContent>
                <CardActions>
                    <Button
                        disabled={disconnected || !id || id === myid}
                        variant="contained"
                        onClick={handleConnect}
                    >
                        Join
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    )
}

function ConnectionItem(props: { connection: PeerConnection }) {
    const { connection } = props
    const { label, open } = connection
    const handleDisconnect = () => connection.close()

    return (
        <Grid item xs>
            <Card>
                <CardHeader title={label} />
                <CardActions>
                    {open ? (
                        <Button variant="outlined" onClick={handleDisconnect}>
                            Disconnect
                        </Button>
                    ) : (
                        <LoadingProgress />
                    )}
                </CardActions>
            </Card>
        </Grid>
    )
}

export default function Peers() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { peers: enabled } = UIFlags
    const peer = useChange(
        bus,
        _ => _.bridges.find(b => b instanceof PeerJSBridge) as PeerJSBridge
    )
    const { connections } = useChange(peer, _ => _) || {}

    return (
        <>
            <h1>Jacdac Peers</h1>
            <Alert severity="warning">Experimental feature</Alert>
            <p>
                This section allows you to connect multiple Jacdac dashboard in
                real time over the web (using WebRTC). This functionality uses
                the &nbsp;
                <Link href="https://peerjs.com/peerserver.html">
                    PeerServer Cloud Service
                </Link>{" "}
                &nbsp; to establish connections. No data is sent through the
                server.
            </p>
            {!enabled && (
                <Alert severity="error">
                    This functionality is not enabled.
                </Alert>
            )}
            {enabled && (
                <Grid container spacing={1}>
                    <PeerItem peer={peer} />
                    <GridHeader title="Peers" />
                    {peer && <ConnectItem peer={peer} />}
                    {connections?.map(conn => (
                        <ConnectionItem key={conn.label} connection={conn} />
                    ))}
                </Grid>
            )}
        </>
    )
}
