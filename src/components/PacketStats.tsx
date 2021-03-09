import { Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { prettySize } from "../../jacdac-ts/src/jdom/pretty";
import { roundWithPrecision } from "../../jacdac-ts/src/jdom/utils";
import JacdacContext, { JacdacContextProps } from "../jacdac/Context";
import useChange from "../jacdac/useChange";

export default function PacketStats() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { stats } = bus;

    const current = useChange(stats, s => s.current);
    if (!current.bytes)
        return null;

    const size = `${prettySize(current.bytes)}/s`
    return <Typography variant="caption" component="span" aria-label={size}>
        {size}
    </Typography>
}
