import JacdacContext, { JacdacContextProps } from "../jacdac/Context";

import React, { useContext } from "react";
import { List } from "@material-ui/core";
import PacketListItem from "./PacketListItem";
import PacketsContext from "./PacketsContext";
import { Alert } from "@material-ui/lab";

export default function PacketsPreview() {
    const { packets } = useContext(PacketsContext);

    if (!packets?.length)
        return <Alert severity="info">Connect to see packets...</Alert>

    return <List>
        {packets.map(packet =>
            <PacketListItem
                key={packet.key}
                packet={packet.packet}
                count={packet.count} />)}
    </List>
}